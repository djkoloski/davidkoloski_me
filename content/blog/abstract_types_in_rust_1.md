+++
title = "Abstract Types in Rust 1"
description = "What is `impl Trait`?"
slug = "abstract-types-in-rust-1"
date = 2022-02-19
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

{{ not_ready() }}

## Foreword

This series is both an explanation and criticism of `impl Trait`. A large portion of this text is dedicated to explaining and understanding the properties of `impl Trait`, but it is not _solely_ an explainer. If you're already familiar with the properties and mechanics of `impl Trait`, you can skip to [the next post](@/blog/abstract_types_in_rust_2.md) to get to the meat of the criticism and the new ideas.

I believe that the current implementation of `impl Trait` is confusing and non-orthogonal. I propose an alternative formulation of `impl Trait` that is more intuitive, restores orthogonality to the feature, and enables more precise and flexible use of abstraction.

## What is `impl Trait`?

`impl Trait` is syntax sugar can be used in argument position or in return position. Let's look at how it can be used and how it desugars to more fundamental Rust syntax.

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

In argument position, each `impl Trait` is assumed to be a different, unique type. If we wanted to take _two_ arguments of the same type, we couldn't use `impl Trait` any more and would have to be more explicit. This doesn't work:

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

Because `x`'s `impl Debug` could be a different concrete type from `y`'s `impl Debug`. Instead, we must write:

```rust
fn pick<T: Debug>(which: bool, x: T, y: T) -> T {
    ...
}
```

Which tells the compiler that we expect two of the same type and will return that type. That's easy enough, we just have to desugar it ourselves and give the compiler a little more information. Let's move on.

### Return position

When used in return position, `impl Traits` is _also_ shorthand for a type that implements the requested traits. However, there's a catch. It takes a function like:

```rust
fn target() -> impl Debug {
    "hello world"
}
```

And desugars it to something like:

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

This desugaring has a special property: the return type gets _abstracted_. Let's contrast this with an _unabstracted_ return type:

```rust
fn target() -> &'static str {
    "hello world"
}
```

There's a subtle but important difference between these two implementations. Normally, if you know the concrete type arguments to a function then you can deduce the corresponding concrete return type. Take this code for example:

```rust
fn combine<T: Add>(lhs: T, rhs: T) -> T::Output {
    lhs.add(rhs)
}

println!("{}", combine(1, 2));
```

Notice how `combine` doesn't guarantee `T::Output: Display`? That means there's no guarantee that `combine` returns something that implements `Display`, right? What's going on?

In this situation, the compiler is deducing the concrete return type of `combine` at the call site and then checking whether _that_ type implements `Display`. We know that `combine(i32, i32)` will return an `i32`, and `i32` implements `Display`, so we have deduced that the return value of that specific call to `combine` will return something that implements `Display`. Problem solved!

Abstraction prevents this kind of introspection by wrapping the output in an _abstract_ wrapper type. In the previous example, the `Target` type proxied the `Debug` impl but _only_ the `Debug` impl. Any other traits implemented by the wrapped `T` are _not_ implemented by `Target<T>`, which prevents that type introspection. An alternate implementation of `combine` that uses `impl Trait` might look like this:

```rust
fn combine<T: Add>(lhs: T, rhs: T) -> impl Display
where
    T::Output: Display,
{
    lhs.add(rhs)
}

println!("{}", combine(1, 2));
```

So everything still works like we expect. The difference comes when we do something like:

```rust
println!("{:?}", combine(1, 2));
```

In the unabstracted `combine`, we can deduce the concrete return type of `combine(1, 2)` and check whether it implements `Debug`. It does, so we can debug print it. However, in the abstracted `combine` we abstracted our return type and that abstracted type _does not_ implement `Debug`. So this won't compile with the abstracted implementation.

So we actually have two options for our functions' return types. One of them is _unabstracted_, where the caller can introspect the concrete type and check whether it implements some unrelated traits. The other is _abstracted_, where we hide the concrete type from the caller in a wrapper and only expose exactly the traits that we choose to. That's the very literal difference between them, but what does that actually _mean_?

## Should you abstract your types?

An abstract type restricts what someone else can know about some concrete type. In the `fn target() -> Target` example, whoever calls `target` knows that it's not just returning any old `T: Debug`, it knows that it's returning exactly `&'static str`. This can be both a blessing and a curse:

### Blessings

On one hand, knowing exactly what type it is lets you reason about its other properties:

```rust
#[derive(Debug)]
struct Wrapper<T>(T);

fn wrap<T>(value: T) -> Wrapper<T> {
    Wrapper(value)
}

println!("{:?}", wrap("hello world"));
```

So even though `wrap` doesn't guarantee that its return type implements `Debug`, we can figure out whether or not it does ourselves. This lets us "leak" our impls through the return type so we can be as helpful as possible with whoever calls our function.

### Curses

But some time in the future, we might change `Wrapper` so that it no longer implements `Debug`:

```rust
struct Wrapper<T>(T);
```

Oh no! That was just for debugging, nobody was supposed to rely on that being implemented! And now we've broken everyone who was relying on that trait. This situation gets worse for [auto traits](https://doc.rust-lang.org/reference/special-types-and-traits.html#auto-traits) like `Send` and `Sync`, since we might change whether our type implements an auto trait just by changing its definition! That's spooky action at a distance!

This is a situation where abstraction can really help us. By limiting the introspection of our public types, we can prevent [Hyrum's Law](https://www.hyrumslaw.com/) from breaking everything downstream from our library.

Hold on though, something's missing here. These have all been free functions; what happens if we do this in a trait?

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

Nice and easy, uncontroversial. But what about...

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

But that doesn't abstract the return type like we want. Instead, we should abstract that with a wrapper to hide the details of the concrete type:

```rust
struct MinerOre<T: Ore>(T);

impl<T: Ore> Ore for MinerOre<T> { ... }

trait Miner {
    type Mine: Ore;
    fn mine() -> MinerOre<Self::Mine>;
}
```

Much better, this can be our canonical desugaring for now. Let's go implement a `Miner`:

```rust
struct Quarry;

impl Miner for Quarry {
    fn mine() -> impl Ore {
        Bauxite
    }
}
```

Which would then desugar to:

```rust
struct Quarry;

impl Miner for Quarry {
    type Mine = Bauxite;
    fn mine() -> MinerOre<Self::Mine> {
        MinerOre(Bauxite)
    }
}
```

This makes sense, but something's not quite right here. The trait is dictating whether the return type of the function is abstract, but shouldn't the impl choose for itself whether to abstract its return type? After all, the impl is the one exposing that concrete type. It should also decide whether to let users introspect on it. Let's consider an alternative desugaring:

### Return position (traits, remixed)

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

Hmm, that _does_ seem more consistent with how the argument position `impl Trait` desugars. Interesting, let's keep that in mind. Anyway, let's write our `Miner` impl now:

```rust
struct Quarry;

impl Miner for Quarry {
    fn mine() -> impl Ore {
        Bauxite
    }
}
```

We can now desugar this to:

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

And now it's the _impl_ that decides whether a return type should be abstract or not. Nice! Now we have a choice of whether or not to abstract our return type in our impl, but the syntax seems a little weird. If we chose not to abstract our return type, the trait and impl would look like this instead:

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

Yeah, that's really weird. There's no associated type in the trait definition, but we have to use it to write our unabstracted trait implementation. This is really confusing me, why doesn't the free function version of `impl Trait` have this problem?

Well actually, it does.

### Return position (remixed)

Let's take a look at our `target` function again:

```rust
fn target() -> impl Debug {
    "hello world"
}
```

An alternative desugaring would be:

```rust
type Target = &'static str;

fn target() -> Target
where
    Target: Debug,
{
    "hello world"
}
```

That would be more consistent, wouldn't it? We aren't hiding the concrete return type, and we're bounding our return type with a trait. This is a lot more like the desugaring for `impl Trait` in argument position. The main sticking point is that this desugaring has to infer the concrete type of `Target`. This is equivalent to writing:

```rust
type Target = _;
```

And allowing the compiler to infer the return type. This kind of type inference is not great, but it's an option.

This leads us to an important question: which of these should be the _real_ `impl Trait`? In [part 2](@/blog/abstract_types_in_rust_2.md), I present my opinion on this question and a possible solution to this problem.
