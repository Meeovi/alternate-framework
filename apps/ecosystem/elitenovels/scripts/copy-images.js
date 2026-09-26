const fs = require('fs');
const path = require('path');

const files = [
  'mbr-1920x1920.jpg',
  'mbr-1080x763.jpg',
  'mbr-1920x1368.jpg',
  'mbr-510x383.jpg',
  'mbr-700x514.jpg',
  'mbr-1-510x340.jpg',
  'mbr-1460x973.jpg',
  'mbr-1-676x676.jpg',
  'mbr-1-700x467.jpg',
  'mbr-3-510x340.jpg'
];

const srcDir = path.resolve(__dirname, '..', 'app', 'assets', 'images');
const destDir = path.resolve(__dirname, '..', 'public', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);

  if (!fs.existsSync(src)) {
    console.warn(`Source not found: ${src}`);
    return;
  }

  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} -> public/images/`);
});

console.log('Done.');
