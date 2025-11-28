#!/usr/bin/env node

/**
 * Icon Generation Script for NanoBanana Chrome Extension
 * 
 * This script converts SVG icons to PNG format in multiple sizes.
 * 
 * Prerequisites:
 * npm install sharp (for Node.js PNG generation)
 * OR use online tools:
 * - https://cloudconvert.com/svg-to-png
 * - https://svgtopng.com/
 * - https://www.aconvert.com/image/svg-to-png/
 * 
 * Usage:
 * node scripts/generate-icons.js
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SIZES = [16, 32, 48, 128];
const INPUT_SVG_SIMPLE = join(__dirname, '../icons/icon-simple.svg');
const INPUT_SVG_DETAILED = join(__dirname, '../icons/icon.svg');
const OUTPUT_DIR = join(__dirname, '../icons');

async function generateIcons() {
  console.log('🎨 Generating NanoBanana icons...\n');

  for (const size of SIZES) {
    try {
      // Use simple icon for small sizes (16, 32), detailed for larger
      const inputSvg = size <= 32 ? INPUT_SVG_SIMPLE : INPUT_SVG_DETAILED;
      const outputPath = join(OUTPUT_DIR, `icon-${size}.png`);

      await sharp(inputSvg)
        .resize(size, size)
        .png({ quality: 100 })
        .toFile(outputPath);

      console.log(`✅ Generated icon-${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('📁 Files saved to: icons/');
  console.log('\n📝 Next steps:');
  console.log('   1. Review the generated PNG files');
  console.log('   2. Update manifest.json with icon paths');
  console.log('   3. Rebuild the extension: npm run build');
}

// Run the script
generateIcons().catch(console.error);
