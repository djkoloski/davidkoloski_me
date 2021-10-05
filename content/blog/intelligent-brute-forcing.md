+++
title = "Intelligent brute forcing"
description = "Solving NP-hard puzzles with the oldest trick in the book"
slug = "intelligent-brute-forcing"
date = 2021-04-10
[taxonomies]
categories = ["rust"]
tags = ["rust", "puzzles"]
+++

Blog post goes here!

## All puzzles

{% anima() %}
{
    "name": "Line Dance",
    "width": 3,
    "height": 1,
    "tiles": [
        "..r"
    ],
    "actors": [
        {
            "color": "red",
            "x": 0,
            "y": 0
        }
    ],
    "minMoves": 2
}
{% end %}

{% anima() %}
{
    "name": "U-Turn",
    "width": 3,
    "height": 3,
    "tiles": [
        "r .",
        ". .",
        "..."
    ],
    "actors": [
        {
            "color": "red",
            "x": 2,
            "y": 2
        }
    ],
    "minMoves": 6
}
{% end %}

{% anima() %}
{
    "name": "Spiral",
    "width": 5,
    "height": 5,
    "tiles": [
        ".....",
        ".   .",
        "... .",
        "    .",
        "r...."
    ],
    "actors": [
        {
            "color": "red",
            "x": 2,
            "y": 2
        }
    ],
    "minMoves": 16
}
{% end %}

{% anima() %}
{
    "name": "Single File",
    "width": 5,
    "height": 3,
    "tiles": [
        ".. rr",
        ".. rr",
        " ... "
    ],
    "actors": [
        {
            "color": "red",
            "x": 0,
            "y": 1
        },
        {
            "color": "red",
            "x": 1,
            "y": 1
        },
        {
            "color": "red",
            "x": 0,
            "y": 2
        },
        {
            "color": "red",
            "x": 1,
            "y": 2
        }
    ],
    "minMoves": 16
}
{% end %}

{% anima() %}
{
    "name": "Oblique",
    "width": 5,
    "height": 5,
    "tiles": [
        " ... ",
        "..r..",
        ".r.r.",
        "..r..",
        " ... "
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 1
        },
        {
            "color": "red",
            "x": 3,
            "y": 1
        },
        {
            "color": "red",
            "x": 1,
            "y": 3
        },
        {
            "color": "red",
            "x": 3,
            "y": 3
        }
    ],
    "minMoves": 10
}
{% end %}

{% anima() %}
{
    "name": "Cycle",
    "width": 5,
    "height": 5,
    "tiles": [
        "..r..",
        ".   .",
        "r   r",
        ".   .",
        "..r.."
    ],
    "actors": [
        {
            "color": "red",
            "x": 0,
            "y": 0
        },
        {
            "color": "red",
            "x": 4,
            "y": 0
        },
        {
            "color": "red",
            "x": 0,
            "y": 4
        },
        {
            "color": "red",
            "x": 4,
            "y": 4
        }
    ],
    "minMoves": 13
}
{% end %}

{% anima() %}
{
    "name": "Octothorpe",
    "width": 5,
    "height": 5,
    "tiles": [
        " . . ",
        ".rrr.",
        " r r ",
        ".rrr.",
        " . . "
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 0
        },
        {
            "color": "red",
            "x": 3,
            "y": 0
        },
        {
            "color": "red",
            "x": 0,
            "y": 1
        },
        {
            "color": "red",
            "x": 4,
            "y": 1
        },
        {
            "color": "red",
            "x": 0,
            "y": 3
        },
        {
            "color": "red",
            "x": 4,
            "y": 3
        },
        {
            "color": "red",
            "x": 1,
            "y": 4
        },
        {
            "color": "red",
            "x": 3,
            "y": 4
        }
    ],
    "minMoves": 7
}
{% end %}

{% anima() %}
{
    "name": "Square Dance",
    "width": 5,
    "height": 5,
    "tiles": [
        " ....",
        ".r.r.",
        ".. ..",
        ".r.r.",
        ".... "
    ],
    "actors": [
        {
            "color": "red",
            "x": 2,
            "y": 1
        },
        {
            "color": "red",
            "x": 1,
            "y": 2
        },
        {
            "color": "red",
            "x": 3,
            "y": 2
        },
        {
            "color": "red",
            "x": 2,
            "y": 3
        }
    ],
    "minMoves": 12
}
{% end %}

{% anima() %}
{
    "name": "Centralize",
    "width": 5,
    "height": 7,
    "tiles": [
        " ... ",
        " . . ",
        ".r.r.",
        ". . .",
        ".r.r.",
        " . . ",
        " ... "
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 0
        },
        {
            "color": "red",
            "x": 3,
            "y": 0
        },
        {
            "color": "red",
            "x": 1,
            "y": 6
        },
        {
            "color": "red",
            "x": 3,
            "y": 6
        }
    ],
    "minMoves": 15
}
{% end %}

{% anima() %}
{
    "name": "Unwind",
    "width": 5,
    "height": 5,
    "tiles": [
        "....b",
        ".    ",
        ". ...",
        ".   .",
        "....."
    ],
    "actors": [
        {
            "color": "blue",
            "x": 2,
            "y": 2
        }
    ],
    "minMoves": 16
}
{% end %}

{% anima() %}
{
    "name": "Spinlock",
    "width": 5,
    "height": 5,
    "tiles": [
        ".....",
        ". b .",
        ".b.b.",
        ". b .",
        "....."
    ],
    "actors": [
        {
            "color": "blue",
            "x": 0,
            "y": 0
        },
        {
            "color": "blue",
            "x": 4,
            "y": 0
        },
        {
            "color": "blue",
            "x": 4,
            "y": 4
        },
        {
            "color": "blue",
            "x": 0,
            "y": 4
        }
    ],
    "minMoves": 11
}
{% end %}

{% anima() %}
{
    "name": "Gimbal Lock",
    "width": 7,
    "height": 3,
    "tiles": [
        "... ...",
        ". r . .",
        "... ..b"
    ],
    "actors": [
        {
            "color": "red",
            "x": 0,
            "y": 2
        },
        {
            "color": "blue",
            "x": 6,
            "y": 2
        }
    ],
    "minMoves": 6
}
{% end %}

{% anima() %}
{
    "name": "Deadlock",
    "width": 3,
    "height": 3,
    "tiles": [
        " . ",
        "br.",
        " b "
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 1
        },
        {
            "color": "blue",
            "x": 2,
            "y": 1
        },
        {
            "color": "blue",
            "x": 1,
            "y": 2
        }
    ],
    "minMoves": 6
}
{% end %}

{% anima() %}
{
    "name": "Sideswipe",
    "width": 5,
    "height": 5,
    "tiles": [
        " ... ",
        ".r.r.",
        ".....",
        ".b.b.",
        " ... "
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 2
        },
        {
            "color": "red",
            "x": 3,
            "y": 2
        },
        {
            "color": "blue",
            "x": 2,
            "y": 1
        },
        {
            "color": "blue",
            "x": 2,
            "y": 3
        }
    ],
    "minMoves": 10
}
{% end %}

{% anima() %}
{
    "name": "Untangle",
    "width": 5,
    "height": 4,
    "tiles": [
        "...  ",
        "b r..",
        "..r b",
        "  ..."
    ],
    "actors": [
        {
            "color": "red",
            "x": 4,
            "y": 0
        },
        {
            "color": "red",
            "x": 0,
            "y": 3
        },
        {
            "color": "blue",
            "x": 2,
            "y": 0
        },
        {
            "color": "blue",
            "x": 2,
            "y": 3
        }
    ],
    "minMoves": 11
}
{% end %}

{% anima() %}
{
    "name": "Traffic Circle",
    "width": 5,
    "height": 3,
    "tiles": [
        " b.r ",
        " . . ",
        "r...b"
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 1
        },
        {
            "color": "red",
            "x": 3,
            "y": 1
        },
        {
            "color": "blue",
            "x": 2,
            "y": 0
        },
        {
            "color": "blue",
            "x": 2,
            "y": 2
        }
    ],
    "minMoves": 8
}
{% end %}

{% anima() %}
{
    "name": "Close Quarters",
    "width": 4,
    "height": 3,
    "tiles": [
        ".rb.",
        ".br.",
        " .. "
    ],
    "actors": [
        {
            "color": "red",
            "x": 0,
            "y": 1
        },
        {
            "color": "red",
            "x": 3,
            "y": 2
        },
        {
            "color": "blue",
            "x": 0,
            "y": 2
        },
        {
            "color": "blue",
            "x": 3,
            "y": 1
        }
    ],
    "minMoves": 11
}
{% end %}

{% anima() %}
{
    "name": "Fractal",
    "width": 5,
    "height": 7,
    "tiles": [
        "  r  ",
        " ... ",
        ". b .",
        ".....",
        ". r .",
        " ... ",
        "  b  "
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 3
        },
        {
            "color": "red",
            "x": 3,
            "y": 3
        },
        {
            "color": "blue",
            "x": 2,
            "y": 2
        },
        {
            "color": "blue",
            "x": 2,
            "y": 4
        }
    ],
    "minMoves": 13
}
{% end %}

{% anima() %}
{
    "name": "Box Step",
    "width": 5,
    "height": 3,
    "tiles": [
        ".r.b.",
        ".....",
        ".b.r."
    ],
    "actors": [
        {
            "color": "red",
            "x": 3,
            "y": 2
        },
        {
            "color": "red",
            "x": 1,
            "y": 0
        },
        {
            "color": "blue",
            "x": 1,
            "y": 2
        },
        {
            "color": "blue",
            "x": 3,
            "y": 0
        }
    ],
    "minMoves": 15
}
{% end %}

{% anima() %}
{
    "name": "Inversion",
    "width": 3,
    "height": 7,
    "tiles": [
        ".r.",
        ". .",
        ".b.",
        ". .",
        ".b.",
        ". .",
        ".r."
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 2
        },
        {
            "color": "red",
            "x": 1,
            "y": 4
        },
        {
            "color": "blue",
            "x": 1,
            "y": 0
        },
        {
            "color": "blue",
            "x": 1,
            "y": 6
        }
    ],
    "minMoves": 14
}
{% end %}

{% anima() %}
{
    "name": "Free Radical",
    "width": 5,
    "height": 5,
    "tiles": [
        ".....",
        "..r..",
        ".r.r.",
        "..r..",
        "....."
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 3
        },
        {
            "color": "red",
            "x": 1,
            "y": 1
        },
        {
            "color": "red",
            "x": 3,
            "y": 1
        },
        {
            "color": "red",
            "x": 3,
            "y": 3
        },
        {
            "color": "blue",
            "x": 2,
            "y": 2
        }
    ],
    "minMoves": 19
}
{% end %}
