#!/usr/bin/env node
/**
 * Generates a JSON manifest of all images in /public/smruti-thumb/
 * and /public/smruti-full/ for the heart collage reveal.
 */
const fs = require('fs');
const path = require('path');

const thumbDir = path.join(__dirname, '..', 'public', 'smruti-thumb');
const outPath = path.join(__dirname, '..', 'public', 'smruti-manifest.json');

const extensions = /\.(jpg|jpeg|png|gif|webp)$/i;
const files = fs.readdirSync(thumbDir).filter(f => extensions.test(f)).sort();

const manifest = files.map((f, i) => ({
  id: i,
  src: '/smruti-thumb/' + f,
  fullSrc: '/smruti-full/' + f,
  alt: 'Smruti ' + (i + 1),
}));

fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated smruti-manifest.json with ${manifest.length} images`);
