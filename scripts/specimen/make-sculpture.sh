#!/bin/sh
# make-sculpture.sh: the home page's sculpture, from the record, in one command.
#
#   sh scripts/specimen/make-sculpture.sh [WORK_DIR]
#
#   1. export the grown specimen, the same geometry the page computes (scripts/specimen/export.mjs);
#   2. render the plate in Blender Cycles: the whole specimen standing, in the browser's pose, with its exact camera
#      (scripts/specimen/fulgurite.py --variant plate: 2000x4000, 768 samples, about 4 minutes on an M4 Pro);
#   3. put each of the home page's eras at its depth (scripts/specimen/eras.mjs);
#   4. cut the web images into public/specimen/ and write lib/specimen/sculpture.generated.ts
#      (scripts/specimen/sculpture.py).
#
# The strike films in public/specimen/film/ are the same script's film-desktop and film-phone variants, from the same
# specimen; see the header of fulgurite.py for those. SKIP_RENDER=1 reuses WORK_DIR/plate-alpha.png if it is there.
# Needs Node 22, Blender 5.2 (BLENDER=...), and Python 3 with Pillow and numpy (PYTHON=...).
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
WORK=${1:-$(mktemp -d)}
B=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
PY=${PYTHON:-python3}
mkdir -p "$WORK"
node --experimental-strip-types --no-warnings "$ROOT/scripts/specimen/export.mjs" "$WORK/specimen.json"
if [ "${SKIP_RENDER:-0}" != 1 ] || [ ! -f "$WORK/plate-alpha.png" ]; then
  # sys.dont_write_bytecode: otherwise Blender's Python writes __pycache__ inside the signed app bundle, which macOS's
  # app-management protection can hold forever on a machine where nobody is there to answer its prompt.
  "$B" -b --factory-startup --python-exit-code 1 --python-expr "import sys; sys.dont_write_bytecode = True" \
    -P "$ROOT/scripts/specimen/fulgurite.py" -- --specimen "$WORK/specimen.json" --variant plate --out "$WORK/plate.png"
fi
node --experimental-strip-types --no-warnings "$ROOT/scripts/specimen/eras.mjs" "$WORK/eras.json"
"$PY" "$ROOT/scripts/specimen/sculpture.py" --plate "$WORK/plate-alpha.png" --camera "$WORK/plate.camera.json" \
  --eras "$WORK/eras.json" --specimen "$WORK/specimen.json" --out "$ROOT/public/specimen" \
  --ts "$ROOT/lib/specimen/sculpture.generated.ts"
echo "[make-sculpture] done: public/specimen/ and lib/specimen/sculpture.generated.ts (work in $WORK)"
