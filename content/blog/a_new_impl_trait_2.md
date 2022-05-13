+++
title = "A new impl Trait 2/4"
description = "Who's afraid of `impl Trait`?"
slug = "abstract-types-in-rust-2"
date = 2022-05-13
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

## Where we left off

In part 1, we explored some possibilities for desugaring `impl Trait` in return position. In this post, I will explore these possibilities more fully and try to discover the logical implications of them. If you're feeling goal-oriented, you can skip to [the next post](@/blog/a_new_impl_trait_3.md) where I discuss prior art and compare my proposal against it.

Let's start far away from desugarings; we'll wander back there soon enough. For the time being, we'll also use standard desugarings for `impl Trait`. To start, let's talk about...

## Abstract return types

I've got some odd code. Let's take a look:

```rust
fn generate<T>(value: T) -> impl FnOnce() -> T {
    move || value
}

fn main() {
    // This works
    let eighteen = || 18;
    let also_eighteen = eighteen.clone();

    // This doesn't?
    let forty_two = generate(42);
    let also_forty_two = forty_two.clone();
}
```

`generate` is a function that accepts a value and returns a closure that returns that value. Well technically, it really returns an `impl FnOnce() -> T` which is an abstract type. In fact, because it's a closure, the _only_ way we can return it is with `impl Trait`. We can't refer to the type of the closure by name, so it can't be used as a concrete type. That's not a problem unless we want to leverage some of its concrete properties. However, closures already have some properties that we may want to take advantage of:

> [_Closure types_](https://doc.rust-lang.org/reference/types/closure.html#other-traits): All closure types implement `Sized`. Additionally, closure types implement the following traits if allowed to do so by the types of the captures it stores:
>
> - `Clone`
> - `Copy`
> - `Sync`
> - `Send`

`Sized`, `Sync`, and `Send` are all auto-traits. For [complicated reasons](https://twitter.com/Gankra_/status/1141413230905966593), we'll ignore these for now and focus on `Clone`.

Because we're returning our closure abstracted, we can't leak whether our closure implements `Clone` back to the caller. And we can't return our closure unabstracted, so we're stuck. The closure that we made locally can be cloned because it's not abstracted, but as soon as it's returned by a function we can no longer clone it!

We could do something like this:

```rust
fn generate_cloneable<T: Clone>(value: T) -> impl (Clone + FnOnce() -> T) {
    move || value
}
```

But now we have two copies of `generate`, and anything that calls it will also need two copies. And so on and so forth. That's pretty inconvenient, but in all fairness, it could be worse.

### It could be worse

Presumably, new traits will be added to the standard library over time. Maybe some of them will be useful enough that closures will implement them, much like they do for `Clone` right now. For now, let's say that we've decided to implement `Debug` for closures. That would be cool, now people can for example check what variables are captured by a closure. In this future, we've just created a huge headache for everyone who wants to return one of them.

To cover all the possible use cases, it's no longer suitable to have two copies of a function with different return types. Now, we need _four_ copies:

- `impl Fn() -> T`
- `Clone + impl Fn() -> T`
- `Debug + impl Fn() -> T`
- `Clone + Debug + impl Fn() -> T`

And four copies of whatever calls those, and so on. That's not sustainable. In a technical sense, we're already here since closures eagerly implement both `Clone` and `Copy`. If we want to return a closure that may implement either of these, we need different functions that all return different `impl Trait`s.

## Changing return types

Let's pretend that we can return our closure as a concrete type, for example by using type inference. This could be done by putting a `_` in return position:

```rust
fn generate_cloneable<T: Clone>(value: T) -> _ {
    move || value
}
```

With an unabstracted return type, we can leak our implemented traits! Now we only need one copy of our closure-returning function. However, there's nowhere in our function signature that we're guaranteeing that our return type is... well anything. This isn't great because we might accidentally change our return type by changing our function body, breaking our semver compatibility without realizing it. Maybe if we had a type alias, we could add some where clauses?

```rust
type MyClosure<T> = _;

fn generate_cloneable<T: Clone>(value: T) -> MyClosure<T>
where
    MyClosure<T>: FnOnce() -> T,
{
    move || value
}
```

We know that `MyClosure` is actually the type of `move || value`, but nobody else who glances at our source code will know that. It's not in our function signature, it's not at the alias declaration site, it's all inferred from our surroundings. And yet, we're now exposing the concrete properties of our closure to everyone. It's a recipe for server violations.

Some of these cases could be mitigated by linting. Places where type inference is used in return position, but the return type can be named. That would keep `impl Trait` just for cases where we want to abstract the return type and type inference just for cases where we can't name the type.

Before we put these ideas together into a coherent proposal, I'd like to address some solutions we already have:

## RPITIT and TAIT

In the [last post](@/blog/a_new_impl_trait_1.md), we looked at "Return position `impl Trait` in traits" (RPITIT) and "Type alias `impl Trait`" (TAIT). To be clear, I don't think either of these proposals are bad. I just think they miss the mark, and it's not their fault. Here's why:

When we desugar return position `impl Trait`, it gets hidden in a wrapper type and that _type_ is abstract. In fact, that type is _an abstraction_ over the concrete type. I argue that we're missing that extra informaiton, and that is leading us down the path of type inference. Instead of declaring our type aliases and leveraging those for inference, we instead have to declare our alias and then be painfully specific everywhere that we use it:

```rust
#![feature(type_alias_impl_trait)]

use ::core::{fmt::Debug, ptr::null};

type Handle = impl Debug;

fn a() -> Handle {
    null::<i32>()
}

fn b() -> Handle {
    null()
}
```

If you thought that this would compile, I don't blame you! We should have all the information we need to deduce that `Integer` is an abstract pointer to an `i32`. However, that's not what we get:

```
error[E0282]: type annotations needed
  --> src/lib.rs:12:5
   |
12 |     null()
   |     ^^^^ cannot infer type for type parameter `T` declared on the function `null`
```

This is because we're inferring the type of `Integer`, and we don't want to accidentally infer the wrong type in a situation where we're _actually_ confused. Compare this to a concrete type alias:

```rust
#![feature(type_alias_impl_trait)]

use ::core::ptr::null;

type Handle = *const i32;

fn null_handle() -> Handle {
    null()
}
```

In this situation, we can infer the type arguments to `null()` and don't have to use a turbofish to specify that it's specifically `null::<i32>()`. This reversal of the inference flow strikes me as ripe for confusing errors and unintuitive type inference problems.

## My proposal

I propose that we introduce new syntax for performing type abstraction. Instead of focusing on the call site, this will instead directly abstract a given concrete type. The goal of this proposal is to separate the broadly-useful type abstraction of `impl Trait` from the narrowly-useful type inference of `impl Trait`. As I mentioned earlier, separating these two features would allow us to use abstracted types freely while still preventing the use of inferred types unless they are absolutely necessary (i.e. for unnameable types).

### `as impl Trait`

Consider this new syntax:

```rust
fn foo() -> &'static str as impl Debug {
    "hello world"
}
```

This new syntax would desugar to:

```rust
struct ImplDebug<T: Debug>(T);

impl<T: Debug> Debug for ImplDebug<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result<(), Error> {
        self.0.fmt(f)
    }
}

fn foo() -> ImplDebug<&'static str> {
    ImplDebug("hello world")
}
```

In this situation, `as impl Trait` would serve as the site where the abstracted type is generated. This gives us more control over when these wrappers are created and allows us to guarantee that multiple functions return the same abstracted type.

This also allows abstract types to be used anywhere a regular type would be, and not just in return position. It would separate the type abstraction of `impl Trait` in return position from the type inference of it in argument position and help solve a number of outstanding problems with type abstraction.

Let's take a look at how this would apply to RPITIT and TAIT.

### Return position impl trait in trait (RPITIT)

Associated types of traits leak concrete types. Someone might use `<MyFoo as Foo>::Bar` somewhere that it needs to be `Debug`, and the compiler will let them do it as long as the constraints check out. But that's not part of our contract, and nobody should be allowed to depend on the fact that `MyBar` implements `Debug` if we don't want them to. So what if we could say something like this instead:

```rust
trait Transformer<T> {
    type Output;
    fn transform(x: &T) -> Self::Output;
}

impl<T: Clone> Transformer<T> for Replicator {
    type Output = T as impl Clone;
    fn transform(x: &T) -> Self::Cloned {
        x.clone()
    }
}
```

Now, the associated `T` type isn't `T`, it's an _abstraction_ of `T`. It's an abstraction that only exposes the fact that `T` implements `Clone`, which is exactly what we want.

### Type alias impl trait (TAIT)

A new approach to TAIT would look like this instead:

```rust
use ::core::{fmt::Debug, ptr::null};

type Handle = *const i32 as impl Debug;

fn a() -> Handle {
    null()
}

fn b() -> Handle {
    null()
}
```

This time, everything checks out. We know that `Handle` is not just any `impl Debug`, it's specifically `*const i32 as impl Debug`. That allows us to use type inference everywhere; we don't even need to turbofish in `a()` this time. And to cap it all off, we still get an abstracted type to hide any trait implementations we want to keep private.

### Publicly abstracted private types

`impl Trait` already allows us to expose private types through `impl Trait`, but now we can go a step further:

```rust
struct Thought;
pub struct Brain;

impl Factory for Brain {
    type Output = Thought as impl Display;
    fn produce() -> Self::Output {
        ...
    }
}
```

Note that `Thought` is _private_, yet we're exposing it _through an abstraction_ in our associated type. This makes it possible for us to swap out the concrete type of `<Brain as Factory>::Output` without it being a breaking change! `Thought` was private and inaccessible, and so we could remove it entirely without causing any semver violations.

### Clarity and concreteness

Because the concrete type of the abstraction is preserved, we can still reason about and use the concrete underlying type. If we wanted to, we could even provide the same type abstracted in some places, and unabstracted in others. We could easily abstract types we didn't make, and use concrete types internally while still exposing them as abstracted externally. And most importantly, the abstracted return types do not depend on the bodies of our functions. We can modify the code however we want and the compiler will prevent us from accidentally modifying our return types.

## Type inference

This leaves us with one final issue to tackle: how to return unnameable type. Think back to our closure example:

```rust
fn generate<T>(value: T) -> ?? as impl FnOnce() -> T {
    move || value
}
```

We've dug ourselves a hole. One of the primary use cases of `impl Trait` was to avoid having to name our closure type. But in order to use `as impl Trait`, we need to do exactly that. This is a situation where we'd have to reach for type inference and write `_ as impl FnOnce() -> T`, which exposes us to the problems of type inference. Now, it's just on a very small scale since it's just for closures and async blocks. But there's a - still not perfect - but better way...

## Name the unnameable

Why couldn't we just give that closure a name? Maybe something like:

```rust
fn generate<T>(value: T) -> type 'A as impl FnOnce() -> T {
    'A: move || value
}
```

So here's some more new syntax. Similarly to how we label loops, we can label the creation sites of unnameable types. That way, we can uniquely refer to them in other places. This would solve both of our outstanding problems:

- With a label, we can now refer to our closure in our signature as `type 'A`.
- Additionally, we can leave off the `as impl Trait` to return our closure concretely. This solves our earlier problem of returning a closure that _may be_ `Clone`, and avoids having to use unrestricted type inference (i.e. `-> _`).

Returning the closure concretely sould be as simple as:

```rust
fn generate<T>(value: T) -> type 'A {
    'A: move || value
}
```

I'm not married to the syntax. It's functional, but I don't think it's great. I'll talk more about this and type inference in later posts.

## Conclusion

In the first post, I stated that I would propose an alternative formulation of `impl Trait` that restores orthogonality. That comes in two parts:

- `as impl Trait` now handles only type abstraction. Unnameable types like closures and async blocks use their own syntax to be named.
- `type 'A` labels for unnameable types enable them to be returned concretely and abstracted cleanly. This is an alternative to type inference, but either will complement `as impl Trait` and get the job done.

Neither of these ideas are new, they have been discussed and considered before. However, I think we now have the experience necessary to fix our past mistakes and a growing need for these more general tools.

In the [third post](@/blog/a_new_impl_trait_3.md), I'll discuss existing proposals and prior art and compare my proposal against them.
