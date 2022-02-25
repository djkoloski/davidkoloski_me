+++
title = "Abstract Types in Rust 2"
description = "Will the real impl Trait please stand up"
slug = "abstract-types-in-rust-2"
date = 2022-02-24
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

{{ not_ready() }}

## Where we left off

In part 1, I laid the foundation of an alternative desugaring for `impl Trait` in return position. This new desugaring left the return type _unabstracted_, allowing the caller to introspect the type and learn more about it than the type signature provides. In this post, I will explore that idea more fully and try to discover the logical implications of it. If you're feeling goal-oriented, you can skip to [the next post](abstract-types-in-rust-3) where I discuss prior art and make my final set of recommendations.

## Implications of unabstracted `impl Trait`

So we've got two possible desugarings for `impl Trait` in return position:

- Abstracted: a function returning `impl Trait` actually returns a new type that only implements exactly the traits specified. The underlying concrete type is hidden from the caller.
- Unabstracted: a function returning `impl Trait` infers the concrete return type, which is not hidden from the caller.

Correspondingly, we have a couple options for what we could do:

- **Choose abstraction**: unabstracted return types should always be concrete
- **Choose unabstraction**: abstracted return types should always be manually wrapped

Right now, we're at "choose abstraction". In order to build motivation for any alternative desugarings, we'll have to come up with some differences between them and leverage them into situations where we get undesirable behavior. So let's do that.

## Unnameable types

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

`generate` is a function that takes a value and returns a closure that returns that value. Well _technically_, it really returns an `impl FnOnce() -> T` which is an abstract type. In fact, because it's a closure, the _only_ way we can return it is as an `impl Trait`. We can't refer to the type of the closure by name, so it can't be used as a concrete type. That's not a problem unless we want to take advantage of some concrete properties of it.

Closures have a special property that we can take advantage of:

> [_Closure types_](https://doc.rust-lang.org/reference/types/closure.html#other-traits)
>
> All closure types implement `Sized`. Additionally, closure types implement the following traits if allowed to do so by the types of the captures it stores:
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

### Forward thinking

Okay, I admit this is a pretty niche case. The amount of functionality this is blocking is miniscule at best. But humor me with a thought experiment.

Someday in the future, perhaps we'll add a new trait to the standard library. Maybe it'll be useful enough that closures will implement it much like they do for `Clone` right now. In this future, we've just created a huge headache for everyone who wants to return closures.

To cover all the possible use cases, it's no longer suitable to have two copies of a function with different return types. Now, we need _four_ copies:

- `impl Fn() -> T`
- `Clone + impl Fn() -> T`
- `CoolTrait + impl Fn() -> T`
- `Clone + CoolTrait + impl Fn() -> T`

And four copies of whatever calls those, and so on. That's not sustainable, and we're technically already here since we have `Clone` and `Copy`. We should take the opportunity we have now and fix this issue.

## Applying `impl Trait`

Let's consider what impacts our options have on this situation:

### Choose abstraction

This is the situation we're currently in. We can't leak the implemented traits of our closure, so we're stuck implementing multiple copies of our functions to support everything that might call them.

### Choose unabstraction

We can leak our implemented traits! Now we only need one copy of our closure-returning function. What are the downsides?

Some might consider this a downside:

```rust
fn return_mystery() -> impl Any {
    "it's a mystery!"
}
```

This theoretically desugars to:

```rust
type Mystery: Any = _;
fn return_mystery() -> Mystery {
    "it's a mystery!"
}
```

We can tell that `Mystery` is actually `&'static str`, but nobody else who glances at our source code will be able to. And yet, they'll be able to rely on all the concrete properties of `&'static str` on accident or on purpose.

Some of these downsides could be mitigated by, for example, linting for these cases. Places where `impl Trait` is used in return position, but the return type can be named. That would be the most extreme, but it would work.

But then what's really the point? I felt like we were on the verge of a great idea, only to run head first into reality and hurt our heads.

{% self_insert() %}
To be clear, I do think that this alone is enough of a reason not to change the desugaring of `impl Trait` in return position. One of the reasons why Rust is so beloved is because it avoids exactly these kinds of situations. It would be a radical departure from the core design principles of Rust to allow type inference for return types. Bear with me for a bit.
{% end %}

Let's keep exploring, maybe we'll come to some sort of conclusion.

## Abstract associated types

So we've got the abstracting version of `impl Trait` in return position. Last post, we identified that traits have a bit of a strange interaction with it:

```rust
trait Miner {
    type Mine: Ore;
    fn mine() -> Self::Mine;
}

struct Quarry;

impl Miner for Quarry {
    type Mine = Bauxite;
    fn mine() -> Self::Mine {
        Bauxite
    }
}
```

We're returning `Bauxite` unabstracted in `Quarry`'s implementation of `Mine`, but we actually want to abstract it. That way we can prevent people from relying on properties that we don't want to guarantee will remain stable. We want to write something like this:

```rust
impl Miner for Quarry {
    fn mine() -> impl Ore { ... }
}
```

We could always manually desugar it ourselves:

```rust
struct ImplOre<T>(T);

impl<T: Ore> Ore for ImplOre<T> { ... }

struct Quarry;

impl Miner for Quarry {
    type Mine = ImplOre<Bauxite>;
    fn mine() -> Self::Mine {
        ImplOre(Bauxite)
    }
}
```

That's pretty reasonable, but especially in complex cases we do not want to have to write out that same wrapper type over and over again. We can't just use `impl Trait` in return position though, since we need to fill out that associated type.

There are currently proposals for allowing `impl Trait` in return position (RPITIT). I think they miss the mark, either because they don't allow abstraction at the impl level, or because they end up with extremely confusing code like this:

```rust
impl Miner for Quarry {
    type Mine = impl Ore;
    fn mine() -> Self::Mine {
        Bauxite
    }
}
```

This is also a problem these proposals share with type alias impl trait (TAIT), which allows code like this:

```rust
type Target = impl Debug;
fn target() -> Target {
    "hello world"
}
```

These two features which, on the surface, appear to be completely unrelated to one another, are just addressing two sides of the problem with return position `impl Trait`. RPITIT addresses the problem for type aliases, and TAIT addresses the problem for free functions. This is a gross over-simplification, but it gets at the core of the issue.

## What I don't like

To be clear, I don't think either of these proposals are bad. I just think they miss the mark, and it's not their fault. Here's why:

When we desugar return position `impl Trait`, it gets hidden in a wrapper type and that _type_ is abstract. In fact, that type is _an abstraction_ over the concrete type. I argue that we're missing that extra informaiton, and it's leading us down the path of type inference. Instead of declaring our type aliases and leveraging those for inference, we instead have to declare our alias and then be painfully specific everywhere that we use it:

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

Because we're inferring the type of `Integer`, and we don't want to accidentally infer the wrong type in a situation where we're _actually_ confused. Compare this to a concrete type alias:

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

I propose that we introduce new syntax for performing type abstraction. Instead of focusing on the call site, this will instead directly abstract a given concrete type, and I propose that it should be:

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

This allows abstract types to be used anywhere a regular type would be, and not just in return position. It would separate the type abstraction of `impl Trait` in return position from the type inference of it in argument position and help solve a number of outstanding problems with type abstraction.

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
    null::<i32>()
}

fn b() -> Handle {
    null()
}
```

This time, everything checks out. We know that `Handle` is not just any `impl Debug`, it's specifically `*const i32 as impl Debug`. That allows us to use type inference everywhere; we don't even need to turbofish in `a()` this time. And to cap it all off, we still get an abstracted type to hide any trait implementations we want to keep private.

### Publicly abstracted private types

With a little more elbow grease, this would also allow constructions like:

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

Because the concrete type of the abstraction is preserved, we can still reason about and use the concrete underlying type. If we wanted to, we could even provide the same type abstracted in some places, and unabstracted in others. We could easily abstract types we didn't make, and use concrete types internally while still exposing them as abstracted externally.

## But there is a problem

Think back to our closure example:

```rust
fn generate<T>(value: T) -> ?? as impl FnOnce() -> T {
    move || value
}
```

We've dug ourselves a hole. In order to use `as impl Trait`, we need to name the concrete type of our closure. But we can't do that! We're in a predicament, but there is a surprisingly straightforward way out.

## Name the unnameable

Why couldn't we just give that closure a name? Maybe something like:

```rust
fn generate<T>(value: T) -> type 'a as impl FnOnce() -> T {
    'a: move || value
}
```

So here's some more new syntax. Similarly to how we label loops, we can label the creation sites of unnameable types. That way, we can uniquely refer to them in other places. This would solve both of our outstanding problems:

Because we labeled our closure, we can now refer to it in our return type as `type 'a`.

Additionally, we can leave off the `as impl Trait` to return our closure concretely. This solves our earlier problem of returning a closure that _may be_ `Clone`!

```rust
fn generate<T>(value: T) -> type 'a {
    'a: move || value
}
```

I'm not married to the syntax. It's functional, but I don't think it's great. I believe the idea is sound though.

## Conclusion

In the first post, I stated that I would propose an alternative formulation of `impl Trait` that restores orthogonality. That comes in two parts:

- `as impl Trait` now handles only type abstraction. Unnameable types like closures and async blocks use their own syntax to be named.
- `type 'a` labels for unnameable types enable them to be returned concretely and abstracted cleanly.

Neither of these ideas are new, they have been discussed and considered before. However, I think we now have the experience necessary to fix our past mistakes and a growing need for these more general tools.

In the [final post](abstract-types-in-rust-3), I'll discuss existing proposals and prior art, discuss the implications of my proposal, and make a final formal recommendation of what I think is the best path forward. I hope you'll read on.
