+++
title = "Static Site Generation with Zola"
description = "A review of Zola and why I'm using it to template and compile my static site"
slug = "ssg-with-zola"
date = 2018-12-02
[taxonomies]
categories = ["web development"]
tags = ["zola", "rust", "static site generation"]
+++

## I'm a big fan of Rust

And so are a lot of other people. There's a lot to love about the language, build system, and packages available. But what really brings it home is the community around the language and how they approach programming. In general, the Rust community seems to strike a good balance between purity and pragmatism. Maybe it's because of what the language was built to do, or maybe it's a copy and paste of Mozilla internal culture, but either way it means that Rust makes really good tools. You might have heard of [ripgrep](https://github.com/BurntSushi/ripgrep), but you probably haven't heard of [Zola](https://www.getzola.org/).

[Zola](https://www.getzola.org/) is a small static site generator that was originally called Gutenberg and is written in Rust. Its key features are:

* No dependencies: it's just a single executable, perfect for embedding in repositories.
* Blazing fast: the average site generation time is well under a second.
* Fully featured: has support for robust HTML templating with [Tera Templates](https://tera.netlify.com/) - another Rust project - and compiles [Sass](https://sass-lang.com/) and Markdown for you.

If this piques your interest already, then I'd suggest you go grab the [latest release](https://github.com/getzola/zola/releases) and follow along.

## Getting started

### Zola init

Making a new site project is incredibly easy - just run:

```sh
zola init my_site
```

and it will create a new directory named `my_site` with the right directory structure set up and ready to go. Just change into the new directory and keep going from there:

```sh
cd my_site
```

### Zola build

Building the site is as simple as running:

```sh
zola build
```

and it will build the entire site into a new directory named `public`. This is how the final build of the site is made; copying the `public` directory to a simple file server is all you need to do to deploy.

### Zola serve

For development, Zola comes with a development server built-in. Run:

```sh
zola serve
```

and it will continuously:

* Watch content, styles, and templates for changes
* Rebuild the site on the fly
* Refresh the page through an injected script

This makes for a really great iteration loop since you don't have to constantly switch back and forth between your text editor and browser to refresh it. For obvious reasons, you shouldn't use use the Zola server to serve your final build.

## Building blocks

### Pages and Sections

Zola is built on the idea that a site is compsed of *pages* and *sections* arranged in a tree structure.

*Pages* are leaf nodes on your site map, and they're meant to contain most or all of your content. Examples include blog posts and informational pages.

*Sections* are branch nodes on your site map, and they're meant to direct the user to the pages that they're interested in. Examples include directories that list out blog posts and link to them.

The `content` directory in a Zola project defines how the site is structured. Each directory defines a new section{{ citation(id=1) }} and the Markdown files inside of it are the pages that are children of that section{{ citation(id=2) }}. This is why your root index page at `my-site.com` is a section: it contains all of the other sections and pages in the site.

### Templates

Zola uses [Tera Templates](https://tera.netlify.com/) for page templating. They have a lot more documentation about the templating engine on their site, so I'll cover mainly how the Tera works with Zola.

Zola will look in the `templates` directory for HTML templates to apply to the Markdown files in the `content` directory. There are three main special templates:

* `section.html` is applied to all sections.
* `page.html` is applied to all pages.
* `index.html` is a special section template applied to the root section instead of `section.html`.

Zola will take all the metadata about sections and pages that it has available, and expose it through a `section` or `page` object to the template. The Markdown for the section or page can be injected into the template through either `{{ section.content }}` or `{{ page.content }}`.

### Sass

Zola automatically compiles any Sass files directly under the `sass` directory into CSS files. Sass is a great set of extensions to CSS that make it easier to write and maintain your styles. I ended up mostly leveraging its variables, but there are a lot of other quality-of-life features and powerful styling tools that make it a joy to use.

### Static content and Assets Colocation

Files placed in the `static` directory will be copied over as-is to the compiled site, so it's a good place to put content that will be used across the entire site.

Zola also supports ["assets colocation"](https://www.getzola.org/documentation/content/overview/#assets-colocation), which is a fancy way of saying that if you put non-Markdown files under the `content` directory, they'll be copied over right next to other Markdown files' compiled HTML pages. This makes it really easy to organize pages that require custom assets like images and javascript files.

## Conclusion

After working with Zola for a while, the overall experience has been very pleasant. At first I found Zola's notion of sections and pages and little unintuitive, but I think that part of that is due to some confusing wording in their site's documentation. It was really easy to set up and the iteration loop is fast and efficient. While it's still a bit rough around the edges{{ citation(id=3) }}, I can definitely recommend it for anyone looking to make a site like mine.

{% footnote(id=1) %}
For all sections except the top-level index, you also need to add an `_index.md`.
{% end %}
{% footnote(id=2) %}
With the exception of any `_index.md` files.
{% end %}
{% footnote(id=3) %}
I had problems with the built-in pagination functionality. It seems like it either doesn't work right or I don't understand it and the docs are too sparse. The server works pretty well for content serving, but every once in a while I managed to crash it with some syntax errors. The system that refreshes the browser page when the server rebuilds content also seems to mess up every once in a while, but restarting the server fixes it.
{% end %}
