#!/bin/sh
# Points git at .githooks, run from the `prepare` lifecycle script.
#
# It refuses to overwrite an existing core.hooksPath: a contributor may be running
# husky, lefthook, or a personal global hooks directory, and silently repointing git
# at ours would disable all of theirs on every `bun install`.
#
# Nothing here may fail the install. Installing a hook is a convenience; a read-only
# .git or a checkout without one is not a reason to fail dependency installation, and
# a non-zero `prepare` reads as a broken package rather than a missing hook.

# Not every install happens in a git checkout — a downloaded zip has no work tree and
# nothing to hook.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

current=$(git config core.hooksPath 2>/dev/null || true)

if [ -n "$current" ] && [ "$current" != ".githooks" ]; then
  echo "install-hooks: core.hooksPath is already \"$current\" — leaving it as it is." >&2
  echo "  The README language-switcher check lives in .githooks/pre-commit. Wire it into" >&2
  echo "  your hook manager, or run \`bun run docs:switcher:check\` before committing." >&2
  exit 0
fi

if ! git config core.hooksPath .githooks 2>/dev/null; then
  echo "install-hooks: could not set core.hooksPath — skipping the pre-commit hook." >&2
  echo "  Run \`bun run docs:switcher:check\` before committing; CI runs it too." >&2
fi

exit 0
