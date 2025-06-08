// This is a development utility script to create placeholder thumbnails for maps
// You would run this once using Node.js to generate the thumbnails
// In a real application, you would create actual thumbnails for each map

const fs = require('fs');
const path = require('path');

// Maps that need thumbnails
const maps = [
  'test-map',
  'campus',
  'lab'
];

// Create an SVG placeholder thumbnail with the map name
function createSvgThumbnail(mapName) {
  // Generate a random pastel color for the background
  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };
  
  const bgColor = getRandomPastelColor();
  const textColor = '#333';
  
  return `
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="280" height="180" x="10" y="10" fill="#fff" opacity="0.6" rx="5" />
  
  <!-- Grid pattern to simulate a map -->
  <g stroke="#ccc" stroke-width="1">
    ${Array.from({length: 10}).map((_, i) => 
      `<line x1="0" y1="${i * 20}" x2="300" y2="${i * 20}" />`
    ).join('')}
    ${Array.from({length: 15}).map((_, i) => 
      `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="200" />`
    ).join('')}
  </g>
  
  <!-- Random "buildings" or "features" -->
  ${Array.from({length: 8}).map(() => {
    const x = 20 + Math.floor(Math.random() * 240);
    const y = 20 + Math.floor(Math.random() * 140);
    const width = 20 + Math.floor(Math.random() * 30);
    const height = 20 + Math.floor(Math.random() * 30);
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${getRandomPastelColor()}" />`;
  }).join('')}
  
  <!-- Map name -->
  <rect x="50" y="80" width="200" height="40" fill="rgba(255,255,255,0.9)" rx="5" />
  <text x="150" y="105" font-family="Arial" font-size="16" text-anchor="middle" fill="${textColor}">
    ${mapName.toUpperCase()} MAP
  </text>
</svg>
  `.trim();
}

// Ensure the directories exist
function ensureDirectoryExists(dirPath) {
  const absolutePath = path.resolve(process.cwd(), dirPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
    console.log(`Created directory: ${absolutePath}`);
  }
}

// Main function
function createPlaceholderThumbnails() {
  maps.forEach(mapName => {
    const thumbnailDir = `public/assets/maps/${mapName}/thumbnail`;
    ensureDirectoryExists(thumbnailDir);
    
    const svgContent = createSvgThumbnail(mapName);
    const thumbnailPath = path.join(thumbnailDir, 'thumbnail.svg');
    
    fs.writeFileSync(thumbnailPath, svgContent);
    console.log(`Created thumbnail for ${mapName} at ${thumbnailPath}`);
  });
  
  console.log('All thumbnails created successfully!');
}

// Execute the function
createPlaceholderThumbnails(); 