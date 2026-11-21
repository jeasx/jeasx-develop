#!/usr/bin/env bash
# Update files in this repo with their counterparts from ../jeasx-expo.
# Only files existing in both repos are copied; files in KEEP are never touched.
set -euo pipefail

TARGET="$(cd "$(dirname "$0")" && pwd)"
SOURCE="${1:-$TARGET/../jeasx-expo}"

KEEP=(
  .dockerignore
  .gitignore
  api/vercel.js
  src/types.d.ts
  Dockerfile
  package-lock.json
  package.json
  README.md
  sync-expo.sh
  tsconfig.json
  vercel.json
)

is_kept() {
  local f
  for f in "${KEEP[@]}"; do [[ "$1" == "$f" ]] && return 0; done
  return 1
}

updated=0
while IFS= read -r -d '' file; do
  is_kept "$file" && continue
  [[ -f "$TARGET/$file" ]] || continue
  if ! cmp -s "$SOURCE/$file" "$TARGET/$file"; then
    cp "$SOURCE/$file" "$TARGET/$file"
    echo "updated: $file"
    updated=$((updated + 1))
  fi
done < <(git -C "$SOURCE" ls-files -z)

echo "$updated file(s) updated."
