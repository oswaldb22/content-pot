const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Function to draw icon
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#3B82F6");
  gradient.addColorStop(1, "#2563EB");

  // Draw background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw "AB" text
  ctx.fillStyle = "white";
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AB", size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
  console.log(`Generated icon${size}.png`);
}

// Generate icons for all required sizes
[16, 48, 128].forEach(drawIcon);
console.log("Icon generation complete!");
