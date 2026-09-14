#!/bin/sh
set -e

# Copy index.html to 404.html so GitHub Pages will serve the SPA entry for
# unknown routes (SPA fallback). Run this after the Vite build step.

if [ -d "dist" ] ; then
  cp -f dist/index.html dist/404.html
  echo "Copied dist/index.html -> dist/404.html"
else
  echo "dist directory not found, skipping copy"
fi
