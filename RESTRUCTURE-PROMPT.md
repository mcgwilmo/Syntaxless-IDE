# Restructure prompts → `restructure/`

This file has been split into six per-phase prompts. See **[restructure/README.md](restructure/README.md)**
for the index, phase order, open decisions, and the measured baseline.

Paste one phase prompt into a fresh Claude Code session — each is self-contained.

| # | Prompt | Goal |
|---|---|---|
| 1 | [naming and docs](restructure/phase-1-naming-and-docs.md) | Purge dead product names, centralize branding, fix a duplicated wire-protocol constant, rewrite both READMEs |
| 2 | [design system](restructure/phase-2-design-system.md) | Token scale + primitives, light-first warm palette, encouraging copy |
| 3 | [backend pipeline](restructure/phase-3-backend-pipeline.md) | `app/pipeline/` with typed stage contracts; split 5 god modules |
| 4 | [frontend features](restructure/phase-4-frontend-features.md) | Decompose the 6,267-line IDE component; typed API client |
| 5 | [lesson content](restructure/phase-5-lesson-content.md) | ~5,800 lines of lesson data out of code into schema-validated content |
| 6 | [tests and CI](restructure/phase-6-tests-and-ci.md) | Frontend test setup, backend stage tests, CI |
