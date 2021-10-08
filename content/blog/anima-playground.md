+++
title = "Anima Playground"
description = "Puzzle playground for Anima puzzles"
slug = "anima-playground"
date = 2021-10-07
[taxonomies]
categories = ["rust"]
tags = ["rust", "puzzles"]
+++

Controls:

- WASD/Arrow keys: Move
- Space: Undo
- Shift + Space: Reset
- Escape: Unfocus (or just click away)

{% anima(dynamic=true) %}
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
{% end %}
