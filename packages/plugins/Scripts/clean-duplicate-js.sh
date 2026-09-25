#!/usr/bin/env bash

echo "Scanning for .js files that have matching .ts files..."

removed=0

# Find every .js file in the repo
find . -type f -name "*.js" | while read -r js; do
  # Build the equivalent .ts path
  ts="${js%.js}.ts"

  # If a .ts file exists at the same path, delete the .js file
  if [ -f "$ts" ]; then
    rm "$js"
    echo "Removed duplicate: $js"
    removed=$((removed + 1))
  fi
done

echo "Done."
