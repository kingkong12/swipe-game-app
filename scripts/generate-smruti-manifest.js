#!/usr/bin/env node
/**
 * Generates a JSON manifest of all images in /public/smruti-thumb/ (for collage)
 * and /public/smruti/ (for full-size zoom).
 * Run before build to keep the manifest up to date.
 */
const fs = require('fs');
const path = require('path');

const thumbDir = path.join(__dirname, '..', 'public', 'smruti-thumb');
const outPath = path.join(__dirname, '..', 'public', 'smruti-manifest.json');

const extensions = /\.(jpg|jpeg|png|gif|webp)$/i;

// Use thumbnails folder as the source of truth
const files = fs.readdirSync(thumbDir).filter(f => extensions.test(f));

const manifest = files.map((f, i) => ({
  id: i,
  src: '/smruti-thumb/' + encodeURIComponent(f),
  fullSrc: '/smruti-full/' + encodeURIComponent(f),
  alt: 'Smruti ' + (i + 1),
}));

fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated smruti-manifest.json with ${manifest.length} images`);
