+++
title = "A new impl Trait 4/4"
description = "The end of `impl Trait`?"
slug = "a-new-impl-trait-4"
date = 2022-05-13
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

## The end

This post is the culmination of the previous three posts, which discussed the [nature of `impl Trait`](@/blog/a_new_impl_trait_1.md), [how to improve it](@/blog/a_new_impl_trait_2.md), and [prior work on `impl Trait`](@/blog/a_new_impl_trait_3.md). This is my final recommendation on a path forward for `impl Trait`.

### Recap

As a quick recap, I suggest introducing a new `as impl Trait` language feature that abstracts types in general. Augmented with either named unnameable types or expanded type inference, this change would enable all existing functionality while making code clearer and more orthogonal.

## Stepping stones

We've been breezing through many different examples and suggestions without really consolidating our knowledge. Let's take some time to build up some higher-level facts that we can use to inform our final analysis.

### The lesser of two evils

In this case, the two evils are **type inference** and **named unnameable types**. In order for `as impl Trait` to function, we must choose one of these. Note that we have already chosen one of these (type inference) with `impl Trait`. Having worked through some of the consequences, I do not pretend to know which would be cleaner, clearer, and most in line with Rust design goals. Let's consult a motivating example:

I would like to have some function `foo` return a closure that yields some given value. Then, I would like to have some function `bar` call `foo` with a predefined value and return the same type. `foo`'s return type must either be _inferred_ or _named_.

#### Inferred

If `foo`'s return type is inferred, then `bar` must either:

- Refer to `foo` to name its return type (i.e. `fn bar() -> <foo as Fn<(T,)>>::Output`)
- Infer it from its body (i.e. `fn bar() -> _ { foo() }`)

A type alias doesn't change the situation here, as it would also either state `type Output = <foo as Fn(T)>::Output` or `type Output = _`.

In the case of inference, we end up long-range type inference and spooky action at a distance. This has the additional downside that it opens the door for inference to be used in places where it's not strictly necessary. This could lead to further confusion and, in my opinion, would render the feature more harm than good.

In the case of function outputs, we end up with `foo` only performing local inference which is considerably better. However, we suffer from the explicit function output signature, especially when we want to change the definition of `foo`. Modifying its arguments would require modifying the type signature of `bar` (or equivalently, the signature of the type alias) even when the return type has not changed. It makes maintenance more difficult at the same time as making discoverability more difficult.

#### Named

If we can name `foo`'s return type, then `bar` can reuse that:

```rust
fn a<T>(value: T) -> type 'Closure<T> {
    'Closure<T>: move || value
}

fn b() -> type 'Closure<i32> {
    a(42)
}
```

This opens up new possibilities with closures, and extends nicely to async blocks which are the other main unnameable type. It also alleviates a major problem with naming these types, which was previously done by creating a type alias and using inference to achieve the same result.

The obvious downside is that this breaks encapsulation. There are also some very thorny questions regarding generics for closures that depend on type arguments. As a result, I recommend making this change a separate issue for `as impl Trait`. In the meantime, we could allow the old-style `impl Trait` wherever we would write `_ as impl Trait` or `type 'Closure as impl Trait`.

### Finer details

With a new syntax `as impl Trait` to perform type abstraction, we must decide:

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

Could we do `let mut x = a()` and then `x = b()`? These run contrary to the idea that `as impl Trait` creates a new type that only exposes a minimum of traits and information, so the answer here must be _no_. This leads naturally to the idea of `as impl Debug` as the desugaring site for abstraction itself:

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

Which works, but suffers from the verbosity of the syntax. This is a problem already discussed with type inference.

## In practice

Now that we have the groundwork laid, we can make some engineering decisions:

### The ultimate goal

I believe that return position `impl Trait` should be deprecated in favor of `as impl Trait`. Additionally, we must either stabilize naming the return value of a function (e.g. `<foo as Fn()>::Output`) or ban `as impl Trait` in return position. It would still be legal in type alises, which would effectively relegate it to syntax sugar for creating abstracted types. That's not necessarily a bad thing; remember that the `?` operator was a huge quality of life improvement and yet is relatively simple syntax sugar.

The major fork in the road is that we must choose between type inference and explicit naming for unnameable types. They both have their pros and cons, and inference could be restricted to a local context if used with named function return values. I believe that any longer-range type inference (e.g. TAIT) is likely to cause more problems than it solves. Explicitly naming unnameable types requires some exotic syntax and may also cause more problems than it solves.

I think it would be acceptable to keep `impl Trait` in argument position since its sugar is sufficiently simple and its purpose is orthogonal to other features. However, I would be in support of removing it entirely to keep the language consistent and clean if others preferred that.

### The way there

On our way there, we can lint and suggest replacing `impl Trait` with a concrete `T as impl Trait`:

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

I see this as very similar to the change from `Trait` to `dyn Trait`, so many of the same strategies are likely to work here as well.

The largest obstacle for `as impl Trait` will be building consensus for either type inference or named unnameables. Because this space is still up in the air, I think a discussion of `as impl Trait` would be good to keep separate. When we do come to a consensus on how to resolve this issue, we can deprecate `impl Trait` completely. That would allow us to complete the transition and resolve many longstanding issues related to `impl Trait`.

## Conclusion

Whew, that was a lot of work. Hopefully I've inspired some new ideas and thoughts about `impl Trait`. Let's have some lively debate about it and see if we can make Rust a better language for everyone.

### Thanks

Thanks to [@computerdruid](https://github.com/computerdruid) and [@tmandry](https://github.com/tmandry) in particular for reviewing this series of posts and helping me hone my understanding of `impl Trait`.
