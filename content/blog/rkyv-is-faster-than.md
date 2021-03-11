+++
title = "rkyv is faster than {bincode, capnp, cbor, flatbuffers, postcard, prost, serde_json}"
description = "And I have the benchmarks to prove it"
slug = "rkyv-is-faster-than"
date = 2021-03-11
[taxonomies]
categories = ["rust"]
tags = ["rust", "rkyv", "serialization"]
+++

I've been working on [rkyv](https://github.com/djkoloski/rkyv), a zero-copy deserialization library, since November of 2020. rkyv is similar to [Cap'n Proto](https://capnproto.org/) and [FlatBuffers](https://google.github.io/flatbuffers), but has a handful of different design choices that make it stand out:

- No type restrictions: you can serialize anything with rkyv
- No external schemas: you can use the library with just `#[derive]`s
- Rust-only: it doesn't sacrifice simplicity and performance for cross-language compatibility
- Safe mutation: the only rust library (I tested) that supports mutating data without deserializing
- Scalable: works equally well for small and large payloads

But just having design goals isn't good enough, you need results to back them up. With that in mind, I can't disclaim enough that I am the creator and maintainer of rkyv. However, the last thing I want is to be biased, so I made some benchmarks to hopefully convince you on their own merits.

## Benchmarks

There are a [couple](https://github.com/erickt/rust-serialization-benchmarks) [different](https://blog.logrocket.com/rust-serialization-whats-ready-for-production-today/) [benchmarks](https://github.com/only-cliches/noproto#benchmarks) already available, but in general they fail in a couple different ways:

### Testing with too little data

This leads to highly variable results and can make it difficult to see whether one library is really faster than another

### Testing only with simple data

The library may perform completely differently with complex and highly structured data

### Testing only serialization and deserialization

For most serialization formats, all you can do is serialize and deserialize data. But zero-copy deserialization libraries can access and traverse data without deserializing it first. Knowing how these operations compare with each other is essential to evaluating their relative performance.

## `rust_serialization_benchmark`

With these shortcomings in mind, I set off to make my own benchmarks. The goal was to be thorough and complete, and I think I did a pretty good job.

You can run the benchmarks yourself or look over the raw data [from the github repo](https://github.com/djkoloski/rust_serialization_benchmark). I'll summarize the results.

### Rules

Each library got tested on three different data sets:

- `log`: a data set of HTTP request logs that are small and contain many strings
- `mesh`: a single mesh composed of triangles, each of which has three vertices and a normal
- `minecraft_savedata`: a highly-structured data set modeled after Minecraft player savedata

Each data set is randomly generated from an RNG seeded with the [first 20 digits of pi](https://en.wikipedia.org/wiki/Nothing-up-my-sleeve_number), so the data tested is identical for every run. For each data set, a library was measured for the following:

- **Serialize**: how long it took to serialize the data
- **Deserialize**: how long it took to deserialize the data
- **Size**: how many bytes the serialized data occupied
- **Zlib**: the serialized size after zlib compression

Additionally, zero-copy deserialization libraries were tested for:

- **Access**: how long it took to get access to the serialized data
- **Read**: how long it took to run through the data and read fields
- **Update**: how long it took to update the serialized data

There are a couple footnotes that need explaining:

1. Abomonation requires a mutable backing to access and read serialized data. This means that it's not viable for some use cases.
2. Abomonation does not support buffer mutation, so this wasn't tested.
3. While Flatbuffers and Cap'n Proto support buffer mutation in the main (usually C++) libraries, the rust counterparts do not and they couldn't be tested for this.
4. None of the other zero-copy deserialization frameworks provided deserialization capabilities by default. Writing and benchmarking my own deserialization code is somewhat meaningless for these. You can get an idea of what sort of deserialization performance you'd get by looking at the read benchmark.
5. Abomonation's `decode` qualified as access not deserialize because it yields an immutable reference instead of a mutable object. In order to deserialize this object, a simple `Clone` would suffice but I'm not here to write and benchmark my own deserialization code.

## Results

### CBOR / serde_json

Unsurprisingly, these two had very similar performance because they're almost the same format. CBOR did a bit better than serde_json in every benchmark, but these two consistently trailed behind all the other frameworks (in some cases, very considerably behind).

### Prost

Prost was the chosen representative for protobuf-style serialization. Its performance was average-to-lackluster on every benchmark, with the exception of the log size benchmark. It beat out postcard, which consistently performed extremely well in the size/zlib categories. This shows just how much the format was optimized for stringy data and minimizing wire size.

### bincode / postcard

Despite being completely different libraries, bincode and postcard had very similar benchmark results. Serialize and deserialize speed were very close for both of them, and the main difference between the two was usually the final size. Postcard consistently beat bincode on size and zlib. I suspect that they are using very similar techniques, but that postcard has a few more tricks up its sleeve that don't cost much to perform but give it a sizeable advantage.

### Cap'n Proto

Cap'n Proto had a good showing, and it proved its worth as a replacement for protobuf. Compared to prost, it was faster to serialize, and supported comparatively fast zero-copy deserialization. These two features are absolutely killer. Unfortunately, it didn't stack up nearly as well against the other zero-copy frameworks. It consistently had disapointing access and read times compared to its competitors, and failed pretty miserably on the mesh size benchmarks. This makes sense as it wasn't built to handle large amounts of raw data, but it was disappointing to see so much wasted space compared to FlatBuffers.

### FlatBuffers

FlatBuffers is the comparison point for zero-copy deserialization. It's got a lot of usage, was built specifically for performance, and proves out the zero-copy concept. It did well in all categories on most of the tests, but had a major stumbling block. In the `minecraft_savedata` test, its serialization performance was by far the worst, even worse than serde_json (which had to write twice as much data!). This highlights a major weakness of FlatBuffers: its very poor serialization performance on highly-structured data. It's possible (even probable) that I wrote this bench more poorly than it could be, but it's enough that I wouldn't recommend its use for general-purpose data.

### Abomonation

Abomonation was definitely a bright spot in the benchmarks. It proved out its insanely fast serialization on every bench, and didn't suffer from some of the size traps that its competitors fell into. It would be an easy library to recommend if it didn't come with so many caveats. It's very unsafe, non-portable, requires mutable backing to access its data, and doesn't support mutations. Nonetheless, abomonation was a really impressive contender in every benchmark.

### rkyv

I went into these benchmarks not knowing how rkyv would perform relative to its peers, but confident that it would make a good showing. It ended up doing much better than I expected. It won nearly every performance category, and was highly competitive with the winner when it didn't. It also did so without compromising on size, where it was also highly competitive. Finally it showed exceptional scalability, peforming equally well on all different kinds of data where its zero-copy competitors all hard shortcomings on one or more of the data sets. Unlike abomonation, it's also a safe, highly-portable format that doesn't need mutable backing and has more feature support than other competitors.

## Conclusion

I welcome and encourage anyone to run [the benchmarks](https://github.com/djkoloski/rust_serialization_benchmark) for themselves and open pull requests to improve or clean up whatever they want. I am confident in the validity of these results, and will happily update the tables as changes are made. I will update my analyses if there are any major changes.

My hope is that this article not only convinced you that [rkyv](https://github.com/djkoloski/rkyv) is one of the best-performing serializers available, but that it also helped you understand the relationships between the different serialization solutions available in rust today.

*If you're interested in rkyv, I encourage you to contribute to the [request for feedback](https://github.com/djkoloski/rkyv/issues/67) for planning its future*

*Thanks to [burntsushi](https://blog.burntsushi.net/ripgrep/) for the article title inspiration*
