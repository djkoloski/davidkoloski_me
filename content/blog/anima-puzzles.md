+++
title = "Anima Puzzles"
description = "Some premade puzzles to sharpen your puzzle solving skills"
slug = "anima-puzzles"
date = 2021-10-10
[taxonomies]
categories = ["rust"]
tags = ["rust", "puzzles"]
+++

{{ <enable_anima /> }}

{% <center> %}

### Controls

- **Move**: WASD/Arrow keys (desktop), swipe (mobile)
- **Undo**: Space (desktop), top left button
- **Reset**: Shift + Space (desktop), bottom left button
- **Unfocus**: Escape (desktop), click away, tap (mobile)

{% </center> %}

{% <anima> %}
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
    "optimalMoves": 2
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 6
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 16
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 16
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 10
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 13
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 7
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 12
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 15
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 16
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 11
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 6
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 6
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 10
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 11
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 8
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 11
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 13
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 15
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 14
}
{% </anima> %}

{% <anima> %}
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
    "optimalMoves": 19
}
{% </anima> %}

{% <anima> %}
{
    "name": "Side Channel",
    "width": 4,
    "height": 5,
    "tiles": [
        ".b..",
        "....",
        "   .",
        "....",
        "r.r."
    ],
    "actors": [
        {
            "color": "blue",
            "x": 1,
            "y": 0
        },
        {
            "color": "red",
            "x": 0,
            "y": 4
        },
        {
            "color": "red",
            "x": 2,
            "y": 4
        }
    ],
    "optimalMoves": 20
}
{% </anima> %}

{% <anima> %}
{
    "name": "Antiparticle",
    "width": 5,
    "height": 5,
    "tiles": [
        ".....",
        ".r.r.",
        ".....",
        ".r.r.",
        "....."
    ],
    "actors": [
        {
            "color": "red",
            "x": 1,
            "y": 2
        },
        {
            "color": "red",
            "x": 2,
            "y": 1
        },
        {
            "color": "red",
            "x": 2,
            "y": 3
        },
        {
            "color": "red",
            "x": 3,
            "y": 2
        },
        {
            "color": "blue",
            "x": 2,
            "y": 2
        }
    ],
    "optimalMoves": 22
}
{% </anima> %}
