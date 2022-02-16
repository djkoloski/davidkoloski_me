+++
title = "Abstract Types in Rust"
description = "A more uniform formulation of impl trait"
slug = "abstract-types-in-rust"
date = 2022-11-02
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

## `impl Trait` is confused

`impl Trait` can be used in argument position or in return position. Here's what they do:

```rust
fn foo(x: impl Debug) {
    dbg!(x);
}
```

desugars to

```rust
fn foo<X: impl Debug>(x: X) {
    dbg!(x);
}
```

And in return position:

```rust
fn foo() -> impl Debug {
    "hello world"
}
```

doesn't really have a desugaring. It's new syntax, isn't that a little odd? Why does the argument
position have a simple desugaring but the return position doesn't? Let's figure that out.

## `impl Trait` should be the type abstraction operator

Consider the following possible desugaring for `impl Trait` in return position:

```rust
fn foo() -> _ as impl Debug {
    "hello world"
}
```

which implies the existence of:

```rust
fn foo() -> _ {
    "hello world"
}
```

Uh oh, completely inferred return types, that's bad right? Well yes, but only because it's not
explicit and doesn't promise anything about the returned type. But we've already seen this problem
elsewhere:

```rust
trait Foo {
    type Bar: Clone;
    fn baz() -> Self::Bar;
}

impl Foo for MyFoo {
    type Bar = MyBar;
    fn baz() -> Self::Bar {
        ...
    }
}
```

Associated types of traits leak concrete types. Someone might use `<MyFoo as Foo>::Bar` somewhere
that it needs to be `Debug`, and the compiler will let them as long as it is. But that's not part of
our contract, and nobody should be allowed to depend on the fact that `MyBar` implements `Debug` if
we don't want them to. So what if we could instead say something like:

```rust
trait Foo {
    type Bar: Clone;
    fn baz() -> Self::Bar;
}

impl Foo for MyFoo {
    type Bar = MyBar as impl Clone;
    fn baz() -> Self::Bar {
        ...
    }
}
```

Now, the associated `Bar` type isn't `MyBar`, it's an _abstraction_ of `MyBar`. It's an abstraction
that only exposes the fact that `Bar` implements `Clone`, which is exactly what we want. Taking this
a little further, this would allow implementations like:

```rust
struct PrivateBar { ... }

impl Foo for MyFoo {
    // ERROR: PrivateBar isn't public and can't be exposed through an associated type
    // type Bar = PrivateBar;
    // OK: PrivateBar is abstracted, so we can expose it
    type Bar = PrivateBar as impl Clone;
    fn baz() -> Self::Bar {
        ...
    }
}
```

So `as impl Trait`, the _type abstraction operator_, does two things:

1. It provides an abstract view of a concrete type which only implements the listed traits,
2. and it publicizes the abstraction.

Combined with this, if we allow `_` in return position then we can build a powerful desugaring:

```rust
fn foo() -> _ as impl Debug {
    "hello world"
}
```

And we could always ban naked `_`s to prevent:

```rust
fn foo() -> _ {
    "hello world"
}
```

But we wouldn't have to if we could write:

```rust
fn foo() -> _: Debug {
    "hello world"
}
```

Which would let us change the concrete return type while still enforcing that the returned type
implements `Debug`. No type abstraction here, so the properties of the returned type are still
"leaky".

## Async

Consider the following async code:

```rust
trait Foo {
    async fn bar() -> Bat;
}
```

Which has a proposed desugaring of:

```rust
trait Foo {
    type Bar: Future<Output = Bat>;
    fn bar() -> Self::Bar;
}
```

So far so good. But we can't name our return type, and that's a problem. If we return an async
block, then it would get exposed through the associated type. Then users could rely on all sorts of
functionality that's not guaranteed, like our future implementing `Send` and `Sync`. But with type
abstraction, we can prevent this from happening:

```rust
trait Foo {
    type Bar: Future<Output = Bat>;
    fn bar() -> Self::Bar;
}

impl Foo for MyFoo {
    type Bar = ??? as impl Future<Output = Bat>;
    fn bar() -> Self::Bar {
        async { ... }
    }
}
```

All we need to do now is name our async block. I propose reusing some existing syntax:

```rust
impl Foo for MyFoo {
    type Bar = type 'bar as impl Future<Output = Bat>;
    fn bar() -> Self::Bar {
        'bar: async { ... }
    }
}
```

Now that we've labeled our async block, we can substitute that in for the concrete name of our type.
This also applies to closures:

```rust
trait Foo {
    type Bar: Fn();
    fn bar() -> Self::Bar;
}

impl Foo for MyFoo {
    type Bar = type 'bar as impl Fn();
    fn bar() -> Self::Bar {
        'bar: || { ... }
    }
}
```

Finally, the most complex example:

```rust
trait Foo {
    async fn bar() -> impl Baz;
}
```

desugars to:

```rust
trait Foo {
    type Baz: Baz;
    type Bar: Future<Output = Self::Baz>;
    fn bar() -> Self::Baz;
}
```

And now we can write our impl:

```rust
impl Foo for MyFoo {
    type Baz = MyBaz as impl Baz;
    type Bar = type 'fut as impl Future<Output = Self::Baz>;
    fn bar() -> Self::Bar {
        'fut: async {
            ...
        }
    }
}
```

Notice that `impl trait` in return position desugars to an associated type for traits. For free
functions, it desugars to `_ as impl Trait`. When assigning an associated type, only the
`as impl Trait` abstraction operator may be used.
