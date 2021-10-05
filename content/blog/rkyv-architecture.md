+++
title = "rkyv architecture and internals"
description = "An overview of rkyv's architecture and internals"
slug = "rkyv-architecture"
date = 2020-11-18
[taxonomies]
categories = ["rust"]
tags = ["rust", "rkyv", "serialization"]
+++

## What is rkyv?

[rkyv](https://github.com/djkoloski/rkyv) is a zero-copy deserialization framework written in rust. It's deeply integrated into the language and has a lot of neat features with the new v0.2.0 release.

I originally released and [posted about rkyv](https://www.reddit.com/r/rust/comments/jss6h4/rkyv_a_zerocopy_deserialization_framework_for_rust/) in the rust subreddit and got a lot of great feedback. Along with a couple highly desired features, many people asked for a blog post about the design and internals of rkyv. This blog post should serve as a jumping-off point to understand rkyv and zero-copy deserialization in general.

## Zero-copy deserialization

Zero-copy deserialization is a technique used to reduce memory consumption and eliminate work when reading from disk or another external source. This isn't really a precise term, since [serde has support](https://github.com/serde-rs/serde/releases/tag/v1.0.0) for zero-copy deserialization, but a very different kind than rkyv. Zero-copy deserialization is more of an umbrella term for techniques that use some of the data from the source and therefore don't copy it when deserializing, hence the name.

To be more precise, rkyv implements total zero-copy deserialization. All of the output of deserialization is borrowed from the input and no work is required to transform it from the external (on-disk) representation to the in-memory one. In practice, this means that you can do things like `mmap` files into memory and use them without deserialization. This is a technique that is sometimes used in the game industry, where performance requirements are very strict. Total zero-copy deserialization can drastically reduce load times which translates directly into a better user experience.

## rkyv architecture

This is where we can start getting into the meat and potatoes of rkyv. The first thing to understand about rkyv is relative pointers.

### Relative pointers

The first hurdle for total zero-copy deserialization is that regular pointers are not serializable. A pointer is just some address in memory, and that means that it might not even be a valid location for your program on a subsequent run. Even if we could get all of our data back into memory, we would still have to fix up the pointers so they point to the right locations.

Relative pointers are a technique where instead of writing an absolute pointer to disk (which wouldn't come back pointing to the right place), we instead write an _offset_ to some memory. That offset essentially points to "the address of this plus some bytes". A simple example of a relative pointer to a string is these bytes:

```txt
0x0000    04 00 00 00 68 65 6c 6c
0x0008    6f 20 77 6f 72 6c 64 21
...
```

We'll assume that our relative pointers use 32-bit offsets. The first four bytes of the archive are the relative pointer, which encodes the offset to the string. The first four bytes are `04 00 00 00`, which is four on little endian machines. This means that the data is located four bytes forward from the address of the offset. Since the offset is located at `0x0000`, we should look for the data at `0x0000 + 4 = 0x0004`!

Taking a peek at that location reveals some bytes that look like ASCII, but we don't know how many yet! Along with the data for the bytes of a string, we also need to encode the length of the string. Let's update our example:

```txt
0x0000    08 00 00 00 0c 00 00 00
0x0008    68 65 6c 6c 6f 20 77 6f
0x0010    72 6c 64 21 cd cd cd cd
...
```

Now there's two four-byte values: first the relative pointer and second the string length. The relative pointer now has bytes `08 00 00 00`, four more than before since we now need to skip over the string length bytes. So the data is now located at `0x0000 + 8 = 0x0008`. The length bytes tell us there should be 12 bytes at that location. Reading off the first 12 bytes from there gives us `"hello world!"`! Success!

In order to map those bytes into a structure in memory, we might put our `ArchivedString` together like this:

```rust
pub struct ArchivedString {
    ptr: i32,
    len: u32,
}

impl ArchivedString {
    pub fn as_bytes(&self) -> &[u8] {
        unsafe {
            let ptr = (self as *const Self)
                .cast::<u8>()
                .add(self.ptr);
            slice::from_raw_parts(ptr, self.len as usize)
        }
    }

    pub fn as_str(&self) -> &str {
        unsafe {
            str::from_utf8_unchecked(self.as_bytes())
        }
    }
}
```

The reality is just a little bit more complicated than this, but this is pretty close to the same code you can find in rkyv right now. The general idea behind rkyv is to take build these structures for all of our types so that we can serialize them out and get them back later without having to deserialize.

### Archiving dependencies

The next problem we have to tackle is actually creating those relative pointers. In order to make one, we need to know the locations of _both_ the target memory and the relative pointer itself. This is a problem; how can we know where the relative pointer should point if we haven't written it yet?

Imagine that we had some struct that had two strings in it:

```rust
struct Pair {
    key: String,
    value: String,
}
```

It's archived version would look like this:

```rust
struct ArchivedPair {
    key: ArchivedString,
    value: ArchivedString,
}
```

In order to make our archived pair, we have to write the bytes of the key and value first, then construct the relative pointers for the strings. Let's brainstorm roughly what that would look like:

```rust
impl Pair {
    fn archive(&self, writer: &mut Write) -> ArchivedPair {
        let key_pos = writer.write(self.key.as_bytes());
        let value_pos = writer.write(self.value.as_bytes());

        let base = writer.pos();

        let key_off = offset_of!(ArchivedPair, key);
        let value_off = offset_of!(ArchivedPair, value);
        ArchivedPair {
            key: ArchivedString::new(
                base + key_off,
                key_pos,
                self.key.len()
            ),
            value: ArchivedString::new(
                base + value_off,
                value_pos,
                self.value.len()
            ),
        }
    }
}
```

Right off the bat, we've introduced some new concepts:

- `offset_of!` is a macro that tells us the offset of a field in our struct. We need to use this to make sure that we're using the positions of the strings _within_ our struct instead of the position of the start of the struct.
- `Write` is a writer like `std::io::Write` that we can write bytes to and which also knows the current position. We need this to get the `base` for our relative pointers.

This is a little simplified, but both of these are both concepts used extensively in rkyv. And this works! But what if we wanted to write an array of `ArchivedPair`s?

We've run into a problem!

We can write out the first pair just fine, but when write out the second pair we accidentally write our two strings where the second pair should be! Because they're in an array, the archived pairs have to be right next to each other. But there has to be a way around this, this is exactly like how we had to write out the key and value before building our pair!

Taking a look at the archive function, you can see that the archive process is broken up into two steps:

1. Write out the bytes of your dependencies
2. Get the current position and figure out your relative pointers using it

This translates to the two core traits in rkyv: `Archive` and `Resolve`. The first step is handled by `Archive` and the second is handled by `Resolve`. So what do these traits do?

### `Archive` and `Resolve`

`Archive` writes out the dependencies of the type and returns a _resolver_. A resolver is a struct that contains the extra information we need to make an archived version of our type from the writer position and original value. A string's implementation might look like this:

```rust
impl Archive for String {
    type Resolver = usize;

    fn archive(&self, writer: &mut Writer) -> Self::Resolver {
        let pos = writer.pos();
        writer.write(self.as_bytes());
        pos
    }
}

impl Resolve for String {
    type Archived = ArchivedString;

    fn resolve(
        &self,
        pos: usize,
        resolver: usize
    ) -> Self::Archived {
        ArchivedString {
            ptr: RelPtr::from_to(pos, resolver),
            len: self.len(),
        }
    }
}
```

In the archive step, we write out the bytes for the string and return the position those bytes were written to. In the resolve step, we take that position and make a new relative pointer that points to them. Now if we wanted to archive an array of strings, we can archive them all and _then_ resolve them all.

Once again, this is very simplified for the sake of example. But the real implementations of these are not too different!

rkyv provides archived versions of core and standard library types for you out of the box, but you still need to provide them for your own types. That's why rkyv also provides a handy derive macro that does all the heavy lifting for you! Just add `#[derive(Archive)]` to your type and rkyv will generate an archived type, resolver, and implementations of `Archive` and `Resolve` automagically.

## Extending rkyv

Being able to archive types made out of library types is enough functionality for some, but there are a few holes in our system that we need to plug up.

The first trait is `ArchiveRef`, which is like `Archive` for unsized types. Instead of resolving to an archived version of themselves, they instead resolve to a something that dereferences to the archived type. A good way to think about this is that `ArchiveRef` is `Archive` for unsized types which use wide pointers with extra associated data.

This allows us to implement `Archive` for types like `Box`, which needs to be able to archive unsized types like slices and str's. We can also archive our own unsized types with things like trailing slices, even though they're pretty uncommon in practice.

The last hole we need to plug is trait objects. Unfortunately this one is pretty complicated, so if you're really interested in how trait object archiving works, I would recommend you look at some of the source for `rkyv_dyn`, the crate that adds trait object serialization to rkyv.

## Conclusion

Even though this overview is pretty basic, it gives a relatively complete overview of how rkyv works internally. The core ideas are pretty simple, the complicated part is really just writing the core and std implementations.

If you weren't interested in rkyv before and are now, try it out and see how you like it! I just shipped a shiny new version with some great new features including validation and mutable archives. You can find the source [on github](https://github.com/djkoloski/rkyv) for more information.

Thanks for reading!
