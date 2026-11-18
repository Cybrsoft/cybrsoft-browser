# Patch queue

Source patches applied on top of the pinned Firefox ESR tree. Order is defined
by [`series`](series).

## Rules
- **Minimal.** Prefer prefs (`prefs/cybrsoft.js`), locked prefs
  (`autoconfig/cybrsoft.cfg`), and theme/branding config over source patches.
  A patch is a last resort.
- **One concern per patch**, named `NNNN-short-description.patch`.
- **Rebase-friendly:** small, well-localized diffs survive upstream churn best.

## Workflow
Create/edit a patch against the engine tree, then regenerate it:

```bash
# after editing files inside engine/
cd engine
git diff > ../patches/0002-my-change.patch
# add the filename to patches/series in the right order
```

Validate the whole queue against the current pin, or a candidate new release:

```bash
build/scripts/apply-patches.sh --check        # against current engine/
build/scripts/rebase.sh 153.8.0               # against a new ESR release
```

`rebase.sh` prints exactly which patches still apply and which conflict, so a
security bump is usually a one-command check.
