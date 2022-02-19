+++
title = "Concrete Voldemort Types"
description = "Name the un-nameable, fight the power"
slug = "concrete-voldemort-types"
date = 2022-11-02
draft = true
[taxonomies]
categories = ["rust"]
tags = ["rust"]
+++

I have an axe to grind with types that can't be named. I want to name them.

### Async

Consider the following async code:

```rust
trait Stream {
    async fn begin() -> impl Iterator;
}
```

This desugars to:

```rust
trait Stream {
    type Output: Iterator;
    type Begin: Future<Output = Self::Output>;
    fn begin() -> Self::Begin;
}
```

So far so good. But `Begin` is going to be a concrete type, and we can't name our return type. That's a problem, since an async block returned from `begin`  then it would get exposed through the associated type. Then users could rely on all sorts of
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
