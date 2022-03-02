+++
title = "Abstract Types in Rust 4"
description = "Cutting the gordian `impl Trait`"
slug = "abstract-types-in-rust-4"
date = 2022-03-02
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

{{ not_ready() }}

## The right frame of mind

This post is the culmination of the previous three posts, which discussed the [nature of `impl Trait`](@/blog/abstract_types_in_rust_1.md), [how to improve it](@/blog/abstract_types_in_rust_2.md), and [prior work on `impl Trait`](@/blog/abstract_types_in_rust_3.md). Finally, I will give my formal recommendation on a path forward for `impl Trait`.

### Recap

As a quick recap, I suggest introducing a new `as impl Trait` language feature that abstracts types in general. Augmented with named unnameable types, this change would enable all existing functionality while making code clearer and more orthogonal.

## Stepping stones

We've been breezing through many different examples and suggestions without really consolidating our knowledge. Let's take some time to build up some higher-level facts that we can use to inform our final analysis.

### The lesser of two evils

In this case, the two evils are **type inference** and **named unnameable types**. In order for `impl Trait` to function, we must choose one of these. Note that since we already have `impl Trait`, we have already chosen one of these (type inference). Having worked through some of the consequences, I do not pretend to know which would be cleaner, clearer, and most in line with Rust design goals. Let's consult a motivating example:

I would like to have some function `a` return a closure that yields some given value. Then, I would like to have some function `b` call `a` with a predefined value and return the same type. `a`'s return type must either be _inferred_ or _named_.

#### Inferred

If `a`'s return type is inferred, then `b` must either:

- Refer to `a` to name its return type (i.e. `fn b() -> <a as Fn<(T,)>>::Output`)
- Infer it from its body (i.e. `fn b() -> _`)

A type alias doesn't change the situation here, as it would also either state `type Output = <a as Fn(T)>::Output` or `type Output = _`.

In the case of inference, we end up long-range type inference and spooky action at a distance. This proposal has the additional downside that it opens the door for inference to be used in places where it's not strictly necessary. This could lead to further confusion and would render the feature more harm than good.

In the case of function outputs, we end up with `a` only performing local inference which is arguably better. However, we suffer from the explicit function output signature, especially when we want to change the definition of `a`. Modifying its arguments would require modifying the type signature of `b` (or equivalently, the signature of the type alias) even when the return type has not changed. It makes maintenance more difficult at the same time as making discoverability more difficult.

#### Named

If we can name `a`'s return type, then `b` can just refer to that:

```rust
fn a<T>(value: T) -> type 'Closure<T> {
    'Closure<T>: move || value
}

fn b() -> type 'Closure<i32> {
    a(42)
}
```

This opens up new possibilities with closures, and extends nicely to async blocks which are the other main unnameable type. This also alleviates a major problem with naming these types, which was previously done by creating a type alias and using inference to achieve the same result.

The obvious downside is that this breaks encapsulation. This is not to be taken lightly, and I don't intend to take it so. There are also some very thorny questions regarding generics for closures that depend on type arguments. As a result, making such a change must not be required for `as impl Trait` and should be kept as a separable clause.

### How opaque are abstract types?

With a new syntax `as impl Trait` to perform type abstraction, we need to figure out some fundamental questions:

#### Are all `i32 as impl Debug` the same type?

As an example:

```rust
fn a() -> i32 as impl Debug {
    42
}

fn b() -> i32 as impl Debug {
    10
}
```

Could we compare `a() == b()`? Or after stating `let mut x = a()` set `x = b()`? These run contrary to the idea that `as impl Trait` creates a new type that only exposes a minimum of traits and information, so the answer here must be _no_. This leads naturally to the idea of `as impl Debug` as the desugaring site for abstraction itself:

```rust
struct A<T: Debug>(T);
fn a() -> A<i32> {
    A(42)
}

struct B<T: Debug>(T);
fn b() -> B<i32> {
    B(10)
}
```

Now it is evident that `a` and `b` do not return types that can be meaningfully compared or exchanged. To unify them:

```rust
type Output = i32 as impl Debug;

fn a() -> Output {
    42
}

fn b() -> Output {
    10
}
```

Would then desugar to:

```rust
struct Output<T: Debug>(T);

fn a() -> Output<i32> {
    Output(42)
}

fn b() -> Output<i32> {
    Output(10)
}
```

In which case we can see that the return values of `a` and `b` can support those operations.

#### Unnamed in return position

It's worth noting that this still suffers from the same composability restrictions that `impl Trait` does in return position:

```rust
// crate `a`
fn a() -> i32 as impl Debug { 42 }

// crate `b`
fn b() -> ?? { a() }
```

Because `b` must return the same type as `a`, it needs some way to return to `a`'s return type. The most commonly suggested way to do this is to use `Fn` traits:

```rust
fn b() -> <a as Fn<()>>::Output { a() }
```

Which works, but suffers from the verbosity of the syntax. This is a problem already discussed as a feature of a type-inferent solution to `impl Trait`, so this example may motivate that as a more complete approach.

## Final proposal

Alright, with all that out of the way I can finally get around to my final recommendations. First, I'll talk about the theoretical ideal and where I think we could be at the end of the road. Second, I'll discuss how that will never happen and where we should set our expectations and exert our effort instead.

### The zealot's guide to `impl Trait`

This is a maximally-offensive revision of `impl Trait`. This is where the evidence leads but implementing it would be insanely destructive. I recommend that we look to this for guidance but do not actually do this.

I believe that return position `impl Trait` should be deprecated entirely in favor of `as impl Trait`. Additionally, some way of naming the return value of a function should be settled on or `as impl Trait` should be banned in return position. This would effectively relegate it to syntax sugar for creating abstracted types, which is sufficiently simple. Remember that the `?` operator was a huge quality of life improvement and yet is relatively simple syntax sugar.

We must choose between inferring and explicit solutions to naming types, and they both have their pros and cons. Local inference could be used, but it will still require naming function return values. Any longer-range inference will just propagate type inference problems further. Explicitly naming unnameable types requires exotic syntax and may cause more problems than it solves by raising questions about syntax.

`impl Trait` in argument position would be acceptable to keep, as its sugar is sufficiently simple and its purpose is orthogonal to other language features. I would be in support of removing it entirely to keep the language clean if others preferred that.

### The engineer's guide to `impl Trait`

Now that that's out of our system, we can get down to business. We have some fundamentally conflicting and overlapping systems that we need to reconcile.

Because `as impl Trait` provides the functionality of type abstraction, we can now desugar `impl Trait` in return position to `_ as impl Trait` and allow the compiler to infer the concrete return type. This requires local inference, but we already had this and we're continuing to abstract the concrete type so this should all be above-board.

We may either allow `impl Trait` to desugar to `_ as impl Trait` and allow for nonlocal inference when used in type aliases (TAIT), or we may ban type inference for nameable types. I think that either outcome is acceptable and perhaps a lint for nameable inferred abstracted types would be the best path:

```rust
type Output = impl Debug;
//            ^^^^^^^^^^
// WARNING: Output is nameable type `i32` and should be declared as:
//   type Output = i32 as impl Debug;
```

This would help push users to use the more explicit `as impl Trait` syntax and help prevent errors down the line from confusing inference situations. Similarly, we should ban or lint on `impl Trait` used on nameable types in return position:

```rust
fn target() -> impl Debug {
//             ^^^^^^^^^^
// WARNING: return type is nameable type `i32` and should be declared as:
//          fn target() -> i32 as impl Debug
    42
}
```

However we must acknowledge that there are still situations where we must allow closures and async blocks to take advantage of inference.

```rust
fn target() -> impl Clone {
    || 42
}
```

And if we want to allow local inference, perhaps a lint would be best in this case as well:

```rust
fn target() -> impl Clone {
//             ^^^^^^^^^^
// WARNING: impl Trait is deprecated
// NOTE:    use explicit inference instead: `_ as impl Clone`
    || 42
}
```

And finally, we must wait for consensus to be built for one of the naming candidates before we can have unabstracted unnameable types. It's sad, but it's reality and we have to acknowledge it.

A primary benefit of this proposal is that if we do come to a consensus on how to name unnameable types, we can very easily deprecate `impl Trait` completely. That would allow us to complete the transition and resolve many longstanding issues related to `impl Trait`.

#### Naming options

The options I suggest for naming unnameable types are, in order from least to most radical:

1. **Local return type inference plus `Fn` traits**: I think the syntax is not great but tolerable.
2. **Named unnameable types**: Potentially complex but much cleaner than LRTI + `Fn` traits.
3. **Nonlocal type inference**: I think this brings so much baggage along with it that it will immediately stall out and fail. Death by a thousand RFC comments.

I hope for #2 but realistically predict #1 if any of these succeed.

## Conclusion

Whew, that was a lot of work. Hopefully I've gotten some gears turning and thoughts running. Let's have some lively debate about `impl Trait` and see if we can make Rust a better language for everyone.

Thanks to [@computerdruid](https://github.com/computerdruid) and [@tmandry](https://github.com/tmandry) in particular for reviewing this series of posts and helping me sharpen and deepen my understanding of `impl Trait`. I couldn't have done it without the help!
