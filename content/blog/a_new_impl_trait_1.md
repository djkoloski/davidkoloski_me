+++
title = "A new impl Trait 1/4"
description = "What is `impl Trait`?"
slug = "a-new-impl-trait-1"
date = 2022-05-10
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

## Foreword

This series is both an explanation and criticism of `impl Trait`. A large portion of this text is dedicated to explaining and understanding the properties of `impl Trait`, but it is not _solely_ an explainer.

- If you're already familiar with the properties and mechanics of `impl Trait`, you can skip to [the next post](@/blog/a_new_impl_trait_2.md).
- If you want to read the past work done on `impl Trait`, you can skip to [the third post](@/blog/a_new_impl_trait_3.md).
- If you're ready for the final proposal, you can skip to [the fourth post](@/blog/a_new_impl_trait_4.md).

I believe that the current implementation of `impl Trait` is confusing and non-orthogonal. I propose an alternative formulation of `impl Trait` that is more intuitive, restores orthogonality to the feature, and enables more precise and flexible use of abstraction.

## What is `impl Trait`?

`impl Trait` is syntax sugar that can be used in argument position or in return position. Let's look at how it can be used and how it desugars to more fundamental Rust syntax.

### Argument position

When used in argument position, `impl Trait` is shorthand for a type that implements the requested traits. It takes a function like:

```rust
fn log(x: impl Debug) {
    dbg!(x);
}
```

And desugars it to:

```rust
fn log<X: Debug>(x: X) {
    dbg!(x);
}
```

In argument position, each `impl Trait` is assumed to be a different, unique type. If we wanted to take _two_ arguments of the same type, we couldn't use `impl Trait` any more and would have to be more explicit. This doesn't compile:

```rust
fn pick(which: bool, x: impl Debug, y: impl Debug) -> impl Debug {
    if !which {
        x
    } else {
        y
    }
}
```

With this error:

```
error[E0308]: `if` and `else` have incompatible types
= note:        expected type `impl Debug`
        found type parameter `impl Debug`
= note: a type parameter was expected, but a different one was found
```

This is because `x`'s `impl Debug` could be a different concrete type from `y`'s `impl Debug`. `impl Trait` makes them appear to be the same type when they really aren't. Instead, we write:

```rust
fn pick<T: Debug>(which: bool, x: T, y: T) -> T {
    ...
}
```

Which tells the compiler that we expect two of the same type and will return that type. That's easy enough, we just have to desugar it ourselves and give the compiler a little more information. Let's move on.

### Return position

When used in return position, `impl Traits` is _also_ shorthand for a type that implements the requested traits. However, there's a catch. It takes a function like this:

```rust
fn target() -> impl Debug {
    "hello world"
}
```

And desugars it to something like this:

```rust
struct Target<T: Debug + ?Sized>(T);

impl<T: Debug + ?Sized> Debug for Target<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result<(), Error> {
        self.0.fmt(f)
    }
}

fn target() -> Target<&'static str> {
    Target("hello world")
}
```

This desugaring has a special property: the return type `&'static str` gets _abstracted_ behind an opaque `Target<T>` wrapper. That lets `target` limit what properties of its return type a caller is allowed to rely on. In this case, the `Target` type proxies the `Debug` impl but _only_ the `Debug` impl. Any other traits implemented by the wrapped `T` are _not_ implemented by `Target<T>`{{ citation() }}. Let's look at a more complex example to see how this affects composability:

```rust
fn combine<T: Add>(lhs: T, rhs: T) -> T::Output {
    lhs.add(rhs)
}

println!("{}", combine(1, 2));
println!("{:?}", combine(1, 2));
```

Without `impl Trait`, the return type of `combine` is just a `T::Output`. That means that `combine(1, 2)` returns a plain `i32`, so we can take advantage of `i32`'s `Display` and `Debug` implementations. Let's compare that to what happens when we use `impl Trait`:

```rust
fn combine_abstract<T: Add>(lhs: T, rhs: T) -> impl Display
where
    T::Output: Display,
{
    lhs.add(rhs)
}

println!("{}", combine_abstract(1, 2));
// ERROR: `impl Display` does not implement `Debug`
println!("{:?}", combine_abstract(1, 2));
```

Now we have _abstracted_ our return type using `impl Trait`, and that opaque return type does not implement `Debug`. Note that we also had to bound `T::Output: Display` since our `impl Display` requires that the value inside of it implements `Display`. While we can still `Display` the return value of `combine_abstract`, we can no longer `Debug` it. That's the very literal difference when using `impl Trait`, but what does that actually mean for our code?

## Should you abstract your types?

An abstract type restricts what someone else can know about a concrete type. In the `fn target() -> &'static str` example, whoever calls `target` gets an unabstracted `&'static str`. This can be both a blessing and a curse:

### The good

On one hand, a concrete type lets you reason about its other properties. In this example, we wrap our input in a type and return it concretely:

```rust
#[derive(Debug, PartialEq)]
pub struct Container<T>(T);

pub fn contain<T>(value: T) -> Container<T> {
    Container(value)
}

println!("{:?}", contain("hello world"));
```

Because `contain` returns `Container` concretely, we can determine whether the return value implements a trait. `T` implements `Debug`, and `Container` implements it if `T` does, so we can debug print the return value from `contain`. This lets us write `contain` to be as helpful as possible to whoever calls it.

### The bad

But what if, some time in the future, we want to change `Container` so that it no longer implements `PartialEq`:

```rust
#[derive(Debug)]
pub struct Container<T>(T);
```

Perhaps that was just for debugging and nobody was supposed to rely on `PartialEq` being implemented. But `Container` is public since it's the return type of `contain`, so we've broken everyone who was relying on `PartialEq` being implemented! This situation gets worse for [auto traits](https://doc.rust-lang.org/reference/special-types-and-traits.html#auto-traits) like `Send` and `Sync` since we might change whether our type implements an auto trait just by changing its definition. That's spooky action at a distance!

This is a situation where `impl Trait` can help us. By returning an `impl Debug`, we can prevent [Hyrum's Law](https://www.hyrumslaw.com/) from breaking everything downstream from our library when we remove the `Debug` implementation:

```rust
pub fn contain<T: Debug>(value: T) -> impl Debug {
    Container(value)
}

println!("{:?}", contain("hello world"));
```

Now our downstream users can't rely on any additional traits being implemented, and we can add and remove more trait implementations from `Container` without causing a semver breakage.

These examples have all been for free functions and inherent methods; what's the situation for traits?

## `impl Trait` in traits

### Argument position (traits)

Not much is different for argument position `impl Trait` in trait methods. Something like this:

```rust
trait Logger {
    fn log(x: impl Debug);
}
```

desugars to:

```rust
trait Logger {
    fn log<X: Debug>(x: X);
}
```

This is pretty much the same as the previous argument position desugaring. But what about...

### Return position (traits)

You can't use `impl Trait` in return position right now, but why is that? Let's consider a desugaring of `impl Trait` as a return type in a trait:

```rust
trait Miner {
    fn mine() -> impl Ore;
}
```

A straightforward desugaring of this would be:

```rust
trait Miner {
    type Mine: Ore;
    fn mine() -> Self::Mine;
}
```

But that doesn't abstract the return type like we want. Instead, we should make a wrapper to hide the details of the concrete type:

```rust
struct MinerOre<T: Ore>(T);

impl<T: Ore> Ore for MinerOre<T> { ... }

trait Miner {
    type Mine: Ore;
    fn mine() -> MinerOre<Self::Mine>;
}
```

This seems sensible, now let's implement a `Miner` with our chosen desugaring:

```rust
struct Quarry;

impl Miner for Quarry {
    fn mine() -> impl Ore {
        Bauxite
    }
}
```

This desugars to:

```rust
struct Quarry;

impl Miner for Quarry {
    type Mine = Bauxite;
    fn mine() -> MinerOre<Self::Mine> {
        MinerOre(Bauxite)
    }
}
```

That makes sense, but I'm left a little dissatisfied. The trait is dictating whether the return type of the function is abstract, but we could let the impl choose whether to abstract its return type. The impl is the one exposing that associated `Mine` type, so we could just set `type Mine = MinerOre<Bauxite>` instead. Let's consider an alternative desugaring:

### Return position (traits, version 2)

Let's change our original desugaring for our trait:

```rust
trait Miner {
    fn mine() -> impl Ore;
}
```

So that it now desugars to:

```rust
trait Miner {
    type Mine: Ore;
    fn mine() -> Self::Mine;
}
```

Note that this is more consistent with how the argument position `impl Trait` desugars, let's keep that in mind. Anyway, now our `Miner` impl is:

```rust
struct Quarry;

impl Miner for Quarry {
    fn mine() -> impl Ore {
        Bauxite
    }
}
```

Which desugars to:

```rust
struct Quarry;

struct QuarryOre<T: Ore>(T);

impl<T: Ore> Ore for QuarryOre<T> { ... }

impl Miner for Quarry {
    type Mine = QuarryOre<Bauxite>;
    fn mine() -> Self::Mine {
        QuarryOre(Bauxite)
    }
}
```

And now it's the _impl_ that decides whether to abstract the return type. Nice, but the syntax seems a little weird. If we chose not to abstract our return type, the trait and impl look like this instead:

```rust
trait Miner {
    fn mine() -> impl Ore;
}

struct Quarry;

impl Miner for Quarry {
    type Mine = Bauxite;
    fn mine() -> Self::Mine {
        Bauxite
    }
}
```

There's no associated type in the trait definition, but we still need it to write our unabstracted trait implementation. So we end up conjuring the associated `Mine` type out of thin air. This is because the `impl Ore` in our `Miner` trait actually desugars to a concrete associated `Mine` type. This is good because we want the implementor to choose whether to abstract their return type. However, `impl Trait` now means different things in different contexts.

- In a trait definition, `impl Trait` is just sugar for an associated type bounded by some trait. This is similar to how `impl Trait` in argument position is just sugar for generics. This desugaring _does not_ abstract the return type.
- In a trait implementation, `impl Trait` _does_ abstract the return type like we would expect.

This desugaring does everything we want at the cost of having some very unintuitive behavior around the secret associated type. In our first desugaring, the one that didn't let the implementor choose whether to abstract the return type, `impl Trait` had syntactic consistency at the cost of flexibility. This new desugaring makes the opposite tradeoff.

### Flipping it around

We can also have the reverse problem if a trait returns an associated type but an implementation wants to abstract its return value:

```rust
trait Miner {
    type Mine: Ore;
    fn mine() -> Self::Mine;
}

struct Quarry;

impl Miner for Quarry {
    type Mine = ???;
    fn mine() -> impl Ore {
        Bauxite
    }
}
```

Since we can no longer tell `Mine` what type it is. We could move the `impl Ore` into the type definition:

```rust
impl Miner for Quarry {
    type Mine = impl Ore;
    fn mine() -> Self::Mine { ... }
}
```

And in fact, this is what the Type Alias Impl Trait (TAIT) proposal suggests. But now the type of `Mine` is being inferred from the body of `mine`. This can lead to confusion:

```rust
impl Miner for Quarry {
    type Mine = impl Ore;
    fn mine() -> Self::Mine {
        Bauxite; // <-- Oops! A stray semicolon!
    }
}
```

If `Ore` is implemented for the unit type `()`, then our code will compile fine but do the wrong thing. We won't know about it until runtime, if we even catch it. Additionally, it's important to note that we would have avoided this if we specified `type Mine = Bauxite` instead of using `impl Trait`.

This is a specific case, but with more complex expressions we can cause much sneakier issues{{ citation() }}. This issue can occur anywhere that infer the return types of functions, and is really a problem with return position `impl Trait` as a whole. What we're doing here is allowing these issues to creep into new places in the language as well, increasing the odds that we'll accidentally stumble across it.

### Meta: who cares?

Is this really so bad though? For many people this will be a mild annoyance, but one that they can live with. Maybe the compiler errors will be a little vague, maybe a few screwball types will get mixed up but caught in unit tests. It's very tempting to never publish these posts, never start any debate, never pitch dumb issues like these back and forth on Github. Who am I really to stand in the way of progress? I don't want to go back to a language where nothing improves or changes or ever gets done.

I see this as a papercut. It's an unsettling reminder of the weird behavior I'd see in C++, where these kinds of issues kept getting added and expanded over multiple language revisions. Eventually, it got so bad that you were not just able but likely to die by a thousand papercuts. You could only write so much code before one of them would get you.

I don't think we have to choose between having footguns and being able to use `impl Trait`. Unfortunately, we're also steaming ahead in implementing and stabilizing all of these features. I don't think that's a bad thing, I admire that as a project we're able to make real progress on new features and improvements. I just think this is a moment for us to take pause and consider some alternatives.

## Conclusion

Alright, so we've got some problems. In [part 2](@/blog/a_new_impl_trait_2.md), I'll describe one possible solution to this problem that allows us to have both consistency and flexibility.

{% footnote() %}
`impl Trait` actually _does_ leak some traits, specifically [auto traits](https://doc.rust-lang.org/beta/unstable-book/language-features/auto-traits.html). Auto traits are automatically implemented for types based on their compositions, so the `Target` struct in our example will implement them if `T` does. This has led to a [now-famous tweet](https://twitter.com/Gankra_/status/1141409682017308672). I'd like to add that `impl Trait` also leaks `Unpin` because it is an auto trait like `Send` and `Sync`.
{% end %}

{% footnote() %}
Consider this code that uses TAIT and GATs:

```rust
#![feature(type_alias_impl_trait)]
#![feature(generic_associated_types)]

trait Miner {
    type Mine<'a> where Self: 'a;
    fn mine(&self) -> Self::Mine<'_>;
}

trait Ore: Clone {
    fn print(&self);
}

impl<T: Ore> Ore for &T {
    fn print(&self) { println!("Ore"); }
}

#[derive(Clone, Copy)]
struct Bauxite;

impl Ore for Bauxite {
    fn print(&self) { println!("Bauxite"); }
}

struct Quarry<T> {
    ore: T,
}

impl<T> Quarry<T> {
    fn ore(&self) -> &T {
        &self.ore
    }
}

impl<T: 'static + Ore> Miner for Quarry<T> {
    type Mine<'a> = impl Ore;
    fn mine(&self) -> Self::Mine<'_> {
        self.ore().clone()
    }
}

fn main() {
    let quarry = Quarry { ore: Bauxite };
    quarry.mine().print();
}
```

If you've written any async code using GATs and TAIT then you may find this kind of code eerily familiar. This prints `Bauxite` like we expect, but if we remove the `: Clone` supertrait from `Ore` (maybe during some refactoring) then it prints `Ore` instead. This issue isn't totally unique to TAIT though, it can also happen in stable Rust:

```rust
trait Ore: Clone {
    fn print(&self);
}

impl<T: Ore> Ore for &T {
    fn print(&self) { println!("Ore"); }
}

#[derive(Clone, Copy)]
struct Bauxite;

impl Ore for Bauxite {
    fn print(&self) { println!("Bauxite"); }
}

struct Quarry<T> {
    ore: T,
}

impl<T: Ore> Quarry<T> {
    fn ore(&self) -> &T {
        &self.ore
    }

    fn mine(&self) -> impl Ore + '_ {
        self.ore().clone()
    }
}

fn main() {
    let quarry = Quarry { ore: Bauxite };
    quarry.mine().print();
}
```

In this case it's only for free functions, and you'd probably find the presence of `impl Ore + '_` a bit more suspicious. What TAIT does is allow this problem cross the trait boundary. Traits are no longer safe from this mistake because this is really a problem with return position `impl Trait` and TAIT enables return position `impl Trait` in traits.
{% end %}
