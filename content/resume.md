+++
title = "Resume"
weight = 1
in_search_index = false
+++

## David Koloski

I'm a software engineer! I usually specialize in systems programming.

## Experience

### Open-source development

I do a lot of open-source work. Some of the highlights:

- I wrote [rkyv], a zero-copy deserialization framework for Rust. You can read
  more about it in the [rkyv book], and see the [Rust serialization benchmark] I
  maintain for serialization in Rust. I also gave a talk about [the many
  mistakes I made while developing rkyv][rkyv talk] at RustConf 2024. rkyv led
  me to develop several other libraries as well:
  - [bytecheck], a runtime type validation framework
  - [munge], a library that adds support for custom destructuring
  - and [rancor], a monomorphizing error handling framework.
- I contribute to the [Rust language] compiler and standard library. I've
  contributed a lot of stuff, but had the most fun tracking down
  [two][miscompile 1] [miscompiles][miscompile 2] caused by the update to LLVM
  17.
- I do lots of smaller projects too, including:
  - A [compiler and virtual machine][rox] for the lox programming language,
    following Bob Nystrom's [Crafting Interpreters]
  - An [x86_64 debugger][ddb], following Sy Brand's [Building a Debugger]
  - An [e-ink weather station][eink frame] for Raspberry Pi

You can view more of my open-source projects and contributions on [GitHub].

[rkyv]: https://github.com/rkyv/rkyv
[rkyv book]: https://rkyv.org
[Rust serialization benchmark]: https://github.com/djkoloski/rust_serialization_benchmark
[rkyv talk]: https://www.youtube.com/watch?v=ON4z2LbTD-4
[bytecheck]: https://github.com/rkyv/bytecheck
[munge]: https://github.com/djkoloski/munge
[rancor]: https://github.com/rkyv/rancor
[Rust language]: https://github.com/rust-lang/rust/pulls?q=is%3Apr+author%3Adjkoloski
[miscompile 1]: https://github.com/rust-lang/rust/issues/115681
[miscompile 2]: https://github.com/rust-lang/rust/issues/115385
[rox]: https://github.com/djkoloski/rox
[Crafting Interpreters]: https://craftinginterpreters.com
[ddb]: https://github.com/djkoloski/ddb
[Building a Debugger]: https://nostarch.com/building-a-debugger
[eink frame]: https://github.com/djkoloski/eink_frame
[GitHub]: https://github.com/djkoloski

### Google

- *Senior Software Engineer*
- *October 2021 - Present*
- *New York City, NY and Remote*

I'm currently working at Google on [Fuchsia]. Right now, I'm on the Fuchsia IPC
team:

- I work on Fuchsia's IPC language: [FIDL]. I improve and maintain the compiler,
  fidlc, as well as the C++, Go, and Rust language bindings.
- I wrote [new Rust bindings] for FIDL that added support for zero-copy
  deserialization, multiple transport backends, and async backpressure while
  also improving encoding and decoding performance.

I also contribute outside of my core work:

- I help maintain our third-party Rust code on Fuchsia. This includes
  maintaining our tooling, enforcing licensing compliance, and reviewing updates
  for malicious and unsound code.
- I set up and ran our unsafe Rust review process on Fuchsia. This was the first
  unsafe Rust review process at Google! It directly led to Google's other review
  policies, and I got to work with other leads in Core, Android, Chromium, and
  more.
- I helped formalize Google's crate auditing standards and made them available
  for other internal and external projects to use. You can find them on
  [GitHub][rust crate audits]! I wrote more about what we did and why on
  [Google's open-source blog].

Previously, I worked on Fuchsia's Rust toolchain team:

- I helped maintain our Rust toolchain; diagnosing, reporting, and fixing issues
  we find while testing the latest nightlies on our codebase.
- I built the Rust compiler's [test suite runner for Fuchsia]. It's a python
  program that manages initializing, configuring, running, and reporting the
  outputs of test binaries in a Fuchsia emulator. It's now part of the Rust
  compiler's CI infrastructure.
- I fixed and improved Rust's standard library support for Fuchsia. Along with
  filling feature gaps and standardizing platform differences, I also documented
  [how to run Rust on Fuchsia emulators]. All of this culminated in bringing
  Fuchsia up to Rust's standards for a Tier 2 platform.

[Fuchsia]: https://fuchsia.dev
[FIDL]: https://fuchsia.dev/fuchsia-src/development/languages/fidl
[new Rust bindings]: https://cs.opensource.google/fuchsia/fuchsia/+/main:tools/fidl/fidlgen_rust_next/;l=1?q=fidlgen_rust_next&sq=&ss=fuchsia
[test suite runner for Fuchsia]: https://github.com/rust-lang/rust/blob/main/src/ci/docker/scripts/fuchsia-test-runner.py
[how to run Rust on Fuchsia emulators]: https://doc.rust-lang.org/nightly/rustc/platform-support/fuchsia.html
[unsafe Rust onboarding materials]: https://github.com/google/learn_unsafe_rust

### Robot Entertainment

- *Programmer*
- *March 2019 - August 2021*
- *Dallas, TX and Remote*

I worked at Robot Entertainment as a programmer. While there, I worked on
several projects:

#### Canceled Project

- *August 2020 - August 2021*

I built a realtime, scalable dungeon generation system. The PGC algorithm was
initially written in Rust, then C++. Both versions were integrated into UE4 so
that artists and designers were able to interact with the system through the
editor UI.

#### Orcs Must Die! 3

- *December 2019 - August 2020*

I worked on Orcs Must Die! 3 with a team of around six other programmers.

Transitioning onto the team, I worked primarily on UI. As the project progressed
and we worked more closely with Stadia's hardware, I took on the graphics
engineering work needed to get UE4 up to par with Google's technical
requirements. Along with the graphics engineering work, I also led the charge on
a number of nasty bugs that came up along the way.

#### ReadySet Heroes

- *March 2019 - December 2019*

I worked on ReadySet Heroes and a DLC update that was released a few months
after launch.

Along with working on a wide variety of tasks over the life of the
project, I owned the UI, graphics programming, and optimization. This was my
first experience as part of the core team on an Unreal project, and I learned
the engine architecture and workflows.

### Vicarious Visions

- *Junior Software Engineer*
- *March 2015 - March 2019*
- *Albany, NY*

#### Unreleased Project

- *November 2018 - March 2019*

I worked on an unreleased project at Vicarious Visions, with a focus on graphics
engineering for mobile.

#### Spyro Reignited Trilogy

- *August 2018 - October 2018*

I helped Toys For Bob and Sanzaru Games finish the Reignited Trilogy during its
final stretch. I was primarily tasked with implementing and maintaining a Spyro
3 minigame, and also helped out more generally fixing bugs and implementing
features. I gained more experience using Unreal Engine 4 in a professional
setting and got the opportunity to help close another project.

#### Destiny 2

- *July 2017 - August 2018, October 2018 - November 2018*

I worked on two main projects in the Destiny franchise. The first project
managed integrating the Blizzard Launcher into Destiny 2 for the PC release. I
worked with protobuf and helped write a lot of the networking code related to
rich presence. Later, I worked on content creation tools in C# that integrated
tightly into Autodesk Maya and 3DS Max. On this project, I was the platform
owner for Maya and helped steer the development philosophy of the tool toward a
strong MVVM architecture.

#### Crash Bandicoot N. Sane Trilogy

- *March 2016 - June 2017*

I was one of four engineers to work on the N. Sane Trilogy from start to finish,
and one of three gameplay engineers on the project. I gained experience working
with Vicarious Visions's proprietary Alchemy game engine and worked in many
diverse areas including audio, visual scripting, physics, input, and control
feel. I gained specific expertise with the audio engine, and implemented support
for PS4 trophy packs while working on the trophy system in general.

#### Guitar Hero Live

- *March 2015 - December 2015*

I worked in collaboration with FreeStyleGames to bring iOS and Apple device
support to Guitar Hero Live. This was my first foray into professional game
development, and I learned a lot about the basics of being a part of a team and
engineering practices. I worked with a wide variety of Apple devices and learned
how to use their development tooling.

## Education

### Rensselaer Polytechnic Institute

- *Undergraduate*
- *August 2013 - December 2016*
- *Troy, NY*

I atttended RPI for three and a half years, earning Bachelor's degrees in
Computer Science and Game and Simulation Arts and Sciences. I graduated Summa
Cum Laude with a 3.99 GPA. During my time at RPI, I worked with the Rensselaer
Center for Open Source (RCOS) and developed open source software over the summer
of 2014.

## Skills

In order of most to least experience.

- Programming Languages: Rust, C/C++, Python, C#, web (JS/TS, HTML, CSS)
- Game Engines: Unreal Engine, Unity, Godot, Bevy
- Graphics APIs: Vulkan, OpenGL
- Web Development: Vue
- VCS: git, Perforce

## Contact

- Email: [david@kolo.ski](mailto:david@kolo.ski)
- GitHub: [djkoloski](http://github.com/djkoloski)
- Bluesky: [david.kolo.ski](http://bsky.app/profile/david.kolo.ski)
- LinkedIn: [dkoloski](http://linkedin.com/in/dkoloski)
