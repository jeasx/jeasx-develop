#!/usr/bin/env bash
# Mirror ../jeasx-expo into this repo, except for the files in KEEP.
#  1. delete all git-tracked files here (node_modules, dist, .env etc. survive)
#  2. copy all files from jeasx-expo (tracked + untracked, not ignored), except SKIP
#  3. restore KEEP files from git HEAD
#  4. remove empty folders
set -euo pipefail

TARGET="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$(cd "${1:-$TARGET/../jeasx-expo}" && pwd)"

KEEP=(
  .dockerignore
  .gitignore
  api/vercel.js
  src/types.d.ts
  bun.lock
  build-manifest.js
  bundle-bun.js
  bundle-esbuild.js
  bunfig.toml
  cli.js
  Dockerfile
  env.d.ts
  env.js
  jeasx.config.js
  LICENSE.txt
  package.json
  README.md
  serverless.js
  serverless.js.map
  serverless.ts
  start.js
  sync-expo.sh
  tsconfig.json
  vercel.json
)

# files from jeasx-expo that are never copied
SKIP=(
  package-lock.json
)

cd "$TARGET"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean, commit or stash your changes first." >&2
  exit 1
fi

# 1. delete tracked files
git ls-files -z | xargs -0 rm -f

# 2. copy files from jeasx-expo
git -C "$SOURCE" ls-files -z --cached --others --exclude-standard |
  while IFS= read -r -d '' file; do
    [[ -f "$SOURCE/$file" ]] || continue
    [[ " ${SKIP[*]} " == *" $file "* ]] && continue
    mkdir -p "$(dirname "$file")"
    cp "$SOURCE/$file" "$file"
  done

# 3. restore files to keep
git checkout HEAD -- "${KEEP[@]}"

# 4. remove empty folders
# (-delete implies -depth, which disables -prune, so exclude paths explicitly)
find . -mindepth 1 -type d -empty -not -path './.git*' -not -path './node_modules*' -print -delete
