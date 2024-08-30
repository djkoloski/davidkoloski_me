+++
title = "How to sort your library in exactly 51,271 steps"
description = "Using Petals of Insight to put your library in an exact order"
slug = "sort-library-steps-mtg"
date = 2024-08-30
[taxonomies]
categories = ["math"]
tags = ["mtg", "puzzles"]
+++

[Today's daily ruling](https://www.youtube.com/watch?v=uhZnHJBH4Ag) on [Judging FtW](https://www.youtube.com/@JudgingFtW) proposed an interesting question that lies at the intersection of mathematics, computer science, and tournament play policy. Take a look at these two cards:

{% center() %}

{{ resize_image(path="/blog/sort-library-steps-mtg/omniscience.jpg", width=300, height=300, op="fit_width") }}

{{ resize_image(path="/blog/sort-library-steps-mtg/petals-of-insight.jpg", width=300, height=300, op="fit_width") }}

{% end %}

Omniscience allows you to cast Petals of Insight without paying its mana cost, and you can choose to return Petals to your hand after it resolves.

It seems intuitive that by casting and re-casting Petals of Insight, you can put your library in an arbitrary order _as long as_ the number of cards in it is not divisible by three or is equal to three. This claim is true, but actually performing this combo runs into an issue.

In Magic: the Gathering, players can "shortcut" repetitive game actions by demonstrating a loop and then declaring the number of times they'd like to execute that loop. This lets players easily take advantage of infinite combos without also requiring them to mechanically perform the actions of that combo; they just have to pick a number of how many times they'd like to do it. According to IPG 3.3:

> IPG 3.3 It is also slow play if a player continues to execute a loop without being able to provide an exact number of iterations and the expected resulting game state.

So while we _can_ shortcut casting Petals of Insight and sorting our cards, we have to provide an exact number of steps that our loop will execute in. For sorting cards, this is a somewhat complex calculation! But we want to combo off, so let's figure it out.

## Scrying through the library

If we have a library of `N` cards, then after casting Petals `N` times without reordering cards, our library will return to the original state. To prove this:

Number each card in your library `0` to `N-1` where the top card is `0` and the bottom card is `N-1`. We start with card `0` on top. Each time we cast Petals, the top three cards are put to the bottom in the same order. This advances the top card by three, looping back to previous cards after all `N` cards have been scried. After `k` casts of Petals, the top card will be `3k mod N`. Thus, by casting `k = N` times, we guarantee that the top card will be `3N mod N = 0`. Because we did not change the orders of any cards, our library will have returned to its original state.

Instead of thinking about our library getting re-arranged after each cast, let's shift our frame of reference and instead think about looking at sets of three cards at a time. As an example, for `N=17` cards, we'll look at the following groups in order:

```
*** ... ... ... ... ..
... *** ... ... ... ..
... ... *** ... ... ..
... ... ... *** ... ..
... ... ... ... *** ..

wrap-around:
*.. ... ... ... ... **

.** *.. ... ... ... ..
... .** *.. ... ... ..
... ... .** *.. ... ..
... ... ... .** *.. ..
... ... ... ... .** *.

wrap-around:
**. ... ... ... ... .*

..* **. ... ... ... ..
... ..* **. ... ... ..
... ... ..* **. ... ..
... ... ... ..* **. ..
... ... ... ... ..* **
```

Where `*` represents the current group of three cards being scried.

## Building a sorting primitive

Now we'll need is a way to change the order of each card in our library in a controlled way.

Let's call casting Petals `N` times a "cycle". In each cycle, there will be exactly one cast where the `k`-th card is the last in its group of three. For the first two cards, these casts "wrap around" the library so we'll choose to do nothing (i.e. wrap-around casts are a "no-op").

To sort a card once, we'll do a cycle of casts. If we see the card we want to sort as the last in its group, we'll move it to the front. Additionally, if we see the card in the very first group of three then we'll move it to the front.

In doing so, we've moved a card of our choice towards the top of our library by up to two places. We've got a sorting primitive!

## Sorting a single card

Each cycle, we can move a single card up to two places closer to the top of our library. If we want to move a particular card to the top of our library, then we'll have to move it at most `N-1` places (if it's at the bottom of our library). This means that we'll have to do `floor(N/2)` cycles to move the bottom card to the top. As a visual demonstration:

```
N = 4: ...*
    1: .*..
    2: *...

N = 5: ....*
    1: ..*..
    2: *....

N = 6: .....*
    1: ...*..
    2: .*....
    3: *.....
```

## Sorting all of the cards

Now that we can sort a single card, let's define our procedure for sorting all of our cards:

For `i` in `0..N-3`, sort the `i`-th card to position `i` in the library. Then sort the last three cards in a single cycle. The library is now sorted.

This isn't the most efficient algorithm for sorting, but it's one that we could feasibly do and which satisfies the requirements for declaring and executing loops. So how many casts does that require?

- To sort the `i`-th card, we'll need to perform `floor(N/2)` cycles as demonstrated above.
- To sort the last three cards of our library, we only have to do a single cycle. One of the casts will look at the final three cards, and we can put them on the bottom in sorted order.

## Counting the casts

So if we have `N` cards in our library, then the number of cycles to sort the library has the following recurrence relationship:

Base case: Sorting the last three cards takes a single cycle.

```
c_3 = 1
```

Recursive case: Sorting the last `N` cards takes `floor(N/2)` cycles plus the number of cycles to sort the last `N-1` cards.

```
c_n = floor(N/2) + c_{n-1}
```

Expanding our recursive case gives:

```
c_n = floor(N/2) + floor((N-1)/2) + floor((N-2)/2) + ... + floor(4/2) + 1
```

And the following exact values:

```
c_3 = 1
c_4 = 3 = 2 + 1
c_5 = 5 = 2 + 3
c_6 = 8 = 3 + 5
c_7 = 11 = 3 + 8
c_8 = 15 = 4 + 11
c_9 = 19 = 4 + 15
...
```

As a quick simplification, let's just replace `1` with `floor(3/2)` since they're the same value:

```
c_n = floor(N/2) + floor((N-1)/2) + floor((N-2)/2) + ... + floor(4/2) + floor(3/2)
```

Now let's move everything under a single `floor`. To do so, we'll need to add an error-correcting term to compensate for the amount that each floor is throwing away. This is relatively straightforward: `floor(x/2)` throws away `1/2` when `x` is odd, and `0` when `x` is even. Thus, it throws away `1/4` on average and so we can subtract `(N-2)/4` to compensate:

```
c_n = floor(N/2 + (N-1)/2 + (N-2)/2 + ... + 4/2 + 3/2 - (N-2)/4)
```

Simplifying:

```
c_n = floor((N + N-1 + N-2 + ... + 4 + 3)/2 - (N-2)/4)
```

We can add and subtract `2 + 1` from the `N` summation to get a complete sequence, and move the subtracted elements out of the group:

```
c_n = floor((N + N-1 + N-2 + ... + 4 + 3 + 2 + 1 - 2 - 1)/2 - (N-2)/4)
    = floor((N + N-1 + N-2 + ... + 4 + 3 + 2 + 1)/2 - 3/2 - (N-2)/4)
```

Using the summation identity for `sum(i..N)` and simplifying:

```
c_n = floor((N*(N+1)/2)/2 - 3/2 - (N-2)/4)
    = floor(N*(N+1)/4 - 6/4 - (N-2)/4)
    = floor((N*(N+1) - 6 - N + 2) / 4)
    = floor((N*(N+1) - N - 4) / 4)
    = floor((N*(N+1) - N) / 4) - 1
    = floor((N*N + N - N) / 4) - 1
    = floor(N*N / 4) - 1
```

And since each cycle requires `N` casts, that gives us our final answer of:

```
C(N) = N * (floor(N*N / 4) - 1)
     = N*floor(N^2/4) - N
```

Where `C(N)` is the number of casts required to sort a library of `N>3` cards.

## Numbers to know

Here are the most important numbers to know:

| Cards in library | Casts of Petals of Insight |
|--:|--:|
| 50 | 31200    |
| 52 | 35100    |
| 53 | 37153    |
| 55 | 41525    |

And here are the exact number of casts to declare when casting Petals of Insight with `N` cards left in your library:

| Cards in library | Casts of Petals of Insight |
|--:|----------:|
| 0 | 0         |
| 1 | 1         |
| 2 | 1         |
| 3 | 1         |
| 4 | 12        |
| 5 | 25        |
| 7 | 77        |
| 8 | 120       |
| 10 | 240      |
| 11 | 319      |
| 13 | 533      |
| 14 | 672      |
| 16 | 1008     |
| 17 | 1207     |
| 19 | 1691     |
| 20 | 1980     |
| 22 | 2640     |
| 23 | 3013     |
| 25 | 3875     |
| 26 | 4368     |
| 28 | 5460     |
| 29 | 6061     |
| 31 | 7409     |
| 32 | 8160     |
| 34 | 9792     |
| 35 | 10675    |
| 37 | 12617    |
| 38 | 13680    |
| 40 | 15960    |
| 41 | 17179    |
| 43 | 19823    |
| 44 | 21252    |
| 46 | 24288    |
| 47 | 25897    |
| 49 | 29351    |
| 50 | 31200    |
| 52 | 35100    |
| 53 | 37153    |
| 55 | 41525    |
| 56 | 43848    |
| 58 | 48720    |
| 59 | 51271    |
