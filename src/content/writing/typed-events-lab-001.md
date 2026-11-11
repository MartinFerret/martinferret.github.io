---
title: The elegant type that slowed down every call site
description: A mapped type with an `as` clause, indexed at every call site, made type-checking about 40% slower with TypeScript 6 and about 65% slower with TypeScript 7. Here is the fix, with the same type safety.
date: 2026-11-04
verifiedOn: ["TypeScript 6.0.3", "TypeScript 7.0.2"]
sources:
  - label: "Lab #001 raw results"
    url: "https://github.com/MartinFerret"
draft: true
---

<!-- DRAFT written from the Lab #001 README. Rewrite in your own voice and replace the source URL with the lab repository once it is public. -->

## The question

Does a mapped type with an `as` clause, indexed at every call site, make type-checking measurably slower than inferring the event name from a generic parameter?

## The setup

The `before` project builds event names from a mapped type with an `as` clause. The `after` project builds the event name from the generic parameter. Both have 1,700+ settings and 200 typed listeners. A `safety.ts` file lists wrong usages that must still fail to compile with the fixed version.

## What I measured

Inferring the event name from the generic parameter cut check time by about 40% with TypeScript 6 and by about 65% with TypeScript 7, with the same type safety. Narrowing `include` to `src` also stopped TypeScript from reading a generated file the app never imports.

## Takeaway

A mapped type with an `as` clause is evaluated backwards at each indexed call site. If you can infer the key from a generic instead, the checker does far less work.

```bash
npm install && npm run lab:001
```
