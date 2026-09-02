---
name: git-flow
description: The git working method for this repo — branch, commit, and PR routine. Use before committing, branching, merging, or opening a pull request.
---

# Git flow — the working method

All work reaches `main` through pull requests. Never commit or merge
directly on `main`, never force-push, never rewrite pushed history
(root CLAUDE.md hard rule 5 — a hook enforces the main/force-push part).

## Branch

- One branch per coherent piece of work, prefixed by kind:
  `feat/`, `fix/`, `chore/`, `docs/` (e.g. `feat/tsugite-palette`).
- Branch from up-to-date `main`.

## Before committing

- Run the tests for the workspace you touched
  (`pnpm --filter tsugite test`, `pnpm --filter docs test`; e2e when
  component contracts changed).
- If token sources (`theme-default/*.tokens.js`) changed, run
  `pnpm tokens` and commit the regenerated CSS with the sources.
- If the work produced a decision, write the ADR in the same branch
  (hard rule 2).

## Commit

- Stage explicitly — name the files. Never `git add -A` or `git add .`.
- Narrative messages in English, matching the repo voice:
  a subject that states what and why ("The Tsugite palette: 55 tokens,
  seven families — the theme-swap stress test"), body only when the
  subject cannot carry the reasoning alone.
- One argument step per commit — split unrelated movements.

## Pull request

- Open with `gh pr create` against `main`; the body summarizes the
  argument of the branch, not the file list.
- Merge happens on GitHub, never locally into `main`.
