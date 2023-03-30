+++
title = "Resume"
weight = 1
in_search_index = false
+++

## David Koloski

Software engineer, game designer, and web developer.

## Experience

### Open-source Rust

- November 2020 - Present

I do a lot of open-source work on and in Rust. Some of the highlights:

- [rkyv] is a zero-copy deserialization framework for Rust. It was my first
  major project in Rust and continues to be widely used in the Rust community.
- [bytecheck] is a runtime struct validation framework built for use with rkyv.
  It's general-purpose but is primarily used by rkyv to perform type validation
  on arbitrary byte buffers.
- I'm currently working on [rel], an object system for Rust based on relative
  pointers. It has a lot of promise but still has a lot of work yet to be done.
- I maintain a suite of [Rust serialization benchmarks] aimed to provide
  high-quality unbiased data on the relative performance of various
  serialization frameworks.
- I'm also very happy with my Rust destructuring library [munge].
- I also occasionally help improve and maintain [zerocopy].

[rkyv]: https://github.com/rkyv/rkyv
[bytecheck]: https://github.com/rkyv/bytecheck
[rel]: https://github.com/rkyv/rel
[Rust serialization benchmarks]: https://github.com/djkoloski/rust_serialization_benchmark
[munge]: https://github.com/djkoloski/munge
[zerocopy]: https://github.com/google/zerocopy

### Rust on Fuchsia

- October 2021 - Present
- Google, New York NY

I'm currently working at Google on the Rust on Fuchsia team.
- I help maintain our Rust toolchain; diagnosing, reporting, and fixing issues
  we find while testing the latest nightlies on our codebase.
- A major project I worked on was building Rust's
  [compiler test suite runner for Fuchsia]. The runner is a python script that
  starts, configures, and runs test binaries on a Fuchsia emulator.
- Along with the test suite runner, I also worked on fixing and improving Rust's
  standard library support for Fuchsia, filling feature gaps, documenting
  platform differences, and [writing documentation] on how to run Rust on
  Fuchsia emulators. All of this culminated in bringing Fuchsia up to Rust's
  standards for a Tier 2 platform (we were previously grandfathered in, and
  could have been demoted to Tier 3).
- I also improved and formalized our unsafe code review processes. We review a
  lot of unsafe code, and make a concerted effort to prevent undefined behavior
  from entering our build via third-party sources. I lead a group of unsafe code
  reviewers in prioritizing, reviewing, and submitting patches upstream for
  third-party crates that we use on Fuchsia.
- Alongside unsafe code review, I'm currently working to formalize our crate
  auditing results and make them available for other internal and external
  projects to use. These secure our supply chain while reducing the amount of
  work we have to do individually and improving our auditing quality.
- I'm also currently helping to write and open-source Google's
  [unsafe Rust onboarding materials], which are aimed at bringing Rust
  programmers up to a consistent level of expertise for reviewing unsafe code.

[compiler test suite runner for Fuchsia]: https://github.com/rust-lang/rust/blob/master/src/ci/docker/scripts/fuchsia-test-runner.py
[writing documentation]: https://doc.rust-lang.org/nightly/rustc/platform-support/fuchsia.html
[unsafe Rust onboarding materials]: https://github.com/google/learn_unsafe_rust

### Unreleased Project (Robot Entertainment)

- August 2020 - August 2021
- Robot Entertainment, Dallas TX

I worked at Robot Entertainment on a canceled project.
I did most of my work on building a realtime, scalable dungeon generation
system. The PGC algorithm was initially written in Rust, then C++. Both versions
were integrated into UE4 so that artists and designers were able to interact
with the system through the editor UI.

### Orcs Must Die! 3

- December 2019 - August 2020
- Robot Entertainment, Dallas TX

I worked on Orcs Must Die! 3 with a team of around six other programmers.
Transitioning onto the team, I worked primarily on UI.
As the project progressed and we worked more closely with Stadia's hardware, I took on the graphics engineering work needed to get UE4 up to par with Google's technical requirements.
Along with the graphics engineering work, I also led the charge on a number of nasty bugs that came up along the way.

### ReadySet Heroes

- March 2019 - December 2019
- Robot Entertainment, Dallas TX

I worked on ReadySet Heroes and a DLC update that was released a few months after launch.
Along with working on a wide variety of tasks over the life of the project, I owned the UI and graphics/optimization.
This was my first experience as part of the core team on an Unreal project, and I learned the engine architecture and workflows.

### Unreleased Project (Vicarious Visions)

- November 2018 - March 2019
- Vicarious Visions, Albany NY

I worked on an unreleased project at Vicarious Visions, with a focus on graphics engineering for mobile. Unfortunately I'm not sure what came of it.

### Spyro Reignited Trilogy

- August 2018 - October 2018
- Vicarious Visions, Albany NY

I helped Toys For Bob and Sanzaru Games finish the Reignited Trilogy during its final stretch. I was primarily tasked with implementing and maintaining a Spyro 3 minigame, and also helped out more generally fixing bugs and implementing features. I gained more experience using Unreal Engine 4 in a professional setting and got the opportunity to help close another project.

### Angelo Ventresca Associates

- August 2017 - May 2018
- Angelo Ventresca Associates, Montrose PA

I built a new website for Angelo Ventresca Associates from the ground up. The client wanted to move to a more modern design with a focus on ease of navigation and mobile compatibility. I worked closely with them to design the site, write the content, deploy the finished product, and update their index in relevant search engines.

### Destiny 2

- July 2017 - August 2018, October 2018 - November 2018
- Vicarious Visions, Albany NY

I worked on two main projects in the Destiny franchise. The first project managed integrating the Blizzard Launcher into Destiny 2 for the PC release. I worked with protobuf and helped write a lot of the networking code related to rich presence. Later, I worked on content creation tools in C# that integrated tightly into Autodesk Maya and 3DS Max. On this project, I was the platform owner for Maya and helped steer the development philosophy of the tool toward a strong MVVM architecture.

### Crash Bandicoot N. Sane Trilogy

- March 2016 - June 2017
- Vicarious Visions, Albany NY

I was one of four engineers to work on the N. Sane Trilogy from start to finish, and one of three gameplay engineers on the project. I gained experience working with Vicarious Visions's proprietary Alchemy game engine and worked in many diverse areas including audio, visual scripting, physics, input, and control feel. I gained expertise with the audio engine, and implemented support for multiple PS4 trophy packs as well as all trophies in the game.

### Guitar Hero Live

- March 2015 - December 2015
- Vicarious Visions, Albany NY

I worked in collaboration with FreeStyleGames to bring iOS and apple device support to Guitar Hero Live. This was my first foray into professional game development, and I learned a lot about the basics of being a part of a team and engineering practices. I worked with a wide variety of apple devices and learned how to properly develop for them.

### Rensselaer Polytechnic Institute

- August 2013 - December 2016
- Rensselaer Polytechnic Institute, Troy NY

I atttended RPI for three and a half years, earning Bachelor's degrees in Computer Science and Game and Simulation Arts and Sciences. I graduated Summa Cum Laude with a 3.99 GPA. During my time at RPI, I worked with the Rensselaer Center for Open Source (RCOS) and developed open source software over the summer of 2014.

## Hard Skills

### Languages

- Rust
- C/C++
- C# + .NET
- JavaScript
- Python
- HTML/CSS

### Game Engines

- Unity
- Unreal Engine 4

### Graphics APIs

- Vulkan
- OpenGL | ES

### Web Development Frameworks

- React
- Vue
- Bulma
- Webpack
- Gulp

### Version Control

- git
- Perforce

## Soft Skills

- Strong collaborator with designers and other developers
- Dedicated team player and eager to help others
- Self-directing, always seeking out new opportunities
- Leadership experience managing individuals and teams

## Contact

- [david@kolo.ski](mailto:david@kolo.ski)
- [github.com/djkoloski](http://github.com/djkoloski)
- [hachyderm.io/@djkoloski](http://hachyderm.io/@djkoloski)
- [linkedin.com/in/dkoloski](http://linkedin.com/in/dkoloski)
