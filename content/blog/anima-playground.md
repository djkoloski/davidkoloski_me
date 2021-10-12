+++
title = "Anima Playground"
description = "Puzzle playground for Anima puzzles"
slug = "anima-playground"
date = 2021-10-10
[taxonomies]
categories = ["rust"]
tags = ["rust", "puzzles"]
+++

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

{% center() %}

### Controls

- **Move**: WASD/Arrow keys (desktop), swipe (mobile)
- **Undo**: Space (desktop), top left button
- **Reset**: Shift + Space (desktop), bottom left button
- **Unfocus**: Escape (desktop), click away, tap (mobile)

{% end %}
