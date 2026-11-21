#!/usr/bin/env bash
# Update files in this repo with their counterparts from ../jeasx-expo.
# New and changed files are copied; files in KEEP are never touched.
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
  [[ -f "$SOURCE/$file" ]] || continue
  if [[ ! -f "$TARGET/$file" ]]; then
    mkdir -p "$(dirname "$TARGET/$file")"
    cp "$SOURCE/$file" "$TARGET/$file"
    echo "added:   $file"
    updated=$((updated + 1))
  elif ! cmp -s "$SOURCE/$file" "$TARGET/$file"; then
    cp "$SOURCE/$file" "$TARGET/$file"
    echo "updated: $file"
    updated=$((updated + 1))
  fi
done < <(git -C "$SOURCE" ls-files -z --cached --others --exclude-standard)

# Remove files that vanished from examples existing in both repos (src/<example>/...).
# Examples only present in this repo are left alone.
removed=0
while IFS= read -r -d '' file; do
  is_kept "$file" && continue
  [[ "$file" == src/*/* ]] || continue
  example="${file#src/}"; example="src/${example%%/*}"
  [[ -d "$SOURCE/$example" ]] || continue
  if [[ ! -e "$SOURCE/$file" && -f "$TARGET/$file" ]]; then
    rm "$TARGET/$file"
    echo "removed: $file"
    removed=$((removed + 1))
  fi
done < <(git -C "$TARGET" ls-files -z)

# Remove empty folders left behind in examples existing in both repos.
for dir in "$TARGET"/src/*/; do
  [[ -d "$SOURCE/src/$(basename "$dir")" ]] || continue
  find "$dir" -mindepth 1 -type d -empty -print -delete | sed "s|^$TARGET/|removed: |"
done

echo "$updated file(s) updated, $removed file(s) removed."
