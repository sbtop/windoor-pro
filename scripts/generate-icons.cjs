// Script para generar iconos PWA desde SVG
// Ejecutar con: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Crear iconos simples como archivos placeholder
// En producción, usa ImageMagick o sharp para convertir SVG a PNG

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Asegurar que el directorio existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Crear iconos placeholder como SVG (se renderizarán bien en todos los dispositivos)
sizes.forEach(size => {
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#0f172a"/>
    <rect x="20" y="30" width="25" height="40" rx="4" fill="#6366f1" stroke="#ffffff" stroke-width="2"/>
    <rect x="55" y="30" width="25" height="40" rx="4" fill="#6366f1" stroke="#ffffff" stroke-width="2"/>
    <text x="50" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">WD</text>
  </svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), iconSvg);
  console.log(`✓ Created icon-${size}x${size}.svg`);
});

// Crear iconos para shortcuts
const newIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#10b981"/>
  <path d="M35 50 L50 35 L50 45 L65 45 L65 55 L50 55 L50 65 Z" fill="white"/>
</svg>`;

const clientsIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#3b82f6"/>
  <circle cx="35" cy="40" r="12" fill="white"/>
  <circle cx="65" cy="40" r="12" fill="white"/>
  <ellipse cx="50" cy="75" rx="25" ry="15" fill="white"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'shortcut-new.svg'), newIconSvg);
fs.writeFileSync(path.join(iconsDir, 'shortcut-clients.svg'), clientsIconSvg);
console.log('✓ Created shortcut icons');

console.log('\n📦 Iconos generados exitosamente!');
console.log('Nota: Los navegadores modernos soportan SVG como iconos de PWA.');
console.log('Para PNGs, considera usar ImageMagick:');
console.log('  convert icon.svg -resize 192x192 icon-192x192.png');
