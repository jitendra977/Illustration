#!/bin/bash
# Create test image files for illustration testing

echo "Creating test files..."

# Create a simple SVG file
cat > test_illustration.svg << 'SVG'
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f0f0f0"/>
  <text x="50%" y="50%" text-anchor="middle" font-size="20" fill="#333">
    Test Illustration
  </text>
</svg>
SVG

# Create another test SVG
cat > test_diagram.svg << 'SVG'
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="#4CAF50"/>
  <rect x="150" y="50" width="100" height="100" fill="#2196F3"/>
  <text x="50%" y="180" text-anchor="middle" font-size="16" fill="#000">
    Engine Diagram
  </text>
</svg>
SVG

echo "✓ Created test_illustration.svg"
echo "✓ Created test_diagram.svg"
echo "Test files ready for upload testing"
