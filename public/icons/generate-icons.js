// This is a Node.js script to generate icon files
// To use it:
// 1. Install the required packages: npm install canvas fs
// 2. Run the script: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to generate an icon
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);
  
  // Draw "B" letter
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size / 2, size / 2);
  
  // Draw a small stack of lines to represent "Stack"
  const lineWidth = size * 0.4;
  const lineHeight = size * 0.05;
  const lineSpacing = size * 0.02;
  const startX = size / 2 - lineWidth / 2;
  const startY = size / 2 + size * 0.2;
  
  // Draw three lines
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      startX, 
      startY + i * (lineHeight + lineSpacing), 
      lineWidth, 
      lineHeight
    );
  }
  
  return canvas;
}

// Generate and save icons
console.log('Generating icons...');

// Generate 192x192 icon
const canvas192 = generateIcon(192);
fs.writeFileSync('public/icons/logo192.png', canvas192.toBuffer('image/png'));
console.log('Generated logo192.png');

// Generate 512x512 icon
const canvas512 = generateIcon(512);
fs.writeFileSync('public/icons/logo512.png', canvas512.toBuffer('image/png'));
console.log('Generated logo512.png');

// Generate 64x64 favicon
const canvas64 = generateIcon(64);
fs.writeFileSync('public/favicon.ico', canvas64.toBuffer('image/png'));
console.log('Generated favicon.ico');

console.log('All icons generated successfully!'); 