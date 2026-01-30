#!/bin/bash
# Script to create a ZIP package of the Mercenary System for GitHub releases
# Usage: ./build-release.sh 1.0.0

VERSION=${1:-"1.0.0"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEM_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$SCRIPT_DIR/releases"
ZIP_NAME="merc-system-$VERSION.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

# Create releases directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Files and folders to include in the ZIP
ITEMS_TO_ZIP=(
    "system.json"
    "template.json"
    "README.md"
    "INSTALLATION.md"
    "LICENSE"
    "scripts"
    "templates"
    "css"
    "lang"
)

# Create a temporary directory for staging
TEMP_DIR=$(mktemp -d)
STAGING_DIR="$TEMP_DIR/merc"
mkdir -p "$STAGING_DIR"

# Copy files to staging directory
for item in "${ITEMS_TO_ZIP[@]}"; do
    SOURCE_PATH="$SYSTEM_DIR/$item"
    DEST_PATH="$STAGING_DIR/$item"
    
    if [ -e "$SOURCE_PATH" ]; then
        if [ -d "$SOURCE_PATH" ]; then
            cp -r "$SOURCE_PATH" "$DEST_PATH"
        else
            cp "$SOURCE_PATH" "$DEST_PATH"
        fi
        echo "✓ Added: $item"
    else
        echo "✗ Warning: Not found: $item"
    fi
done

# Create ZIP file
echo ""
echo "Creating ZIP file: $ZIP_NAME..."
cd "$TEMP_DIR"
zip -r "$ZIP_PATH" merc > /dev/null 2>&1

if [ -f "$ZIP_PATH" ]; then
    SIZE=$(du -h "$ZIP_PATH" | cut -f1)
    echo "✓ ZIP created successfully!"
    echo "  Path: $ZIP_PATH"
    echo "  Size: $SIZE"
    echo ""
    echo "Next steps:"
    echo "1. Upload this ZIP to GitHub Releases for v$VERSION"
    echo "2. Update the download URL in system.json:"
    echo "   https://github.com/nawack/merc2/releases/download/v$VERSION/$ZIP_NAME"
else
    echo "✗ Error: Failed to create ZIP file"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "✓ Build complete!"
