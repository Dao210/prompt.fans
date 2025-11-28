# NanoBanana Icons

This directory contains the icon assets for the NanoBanana Chrome Extension.

## Files

- `icon.svg` - Detailed version for larger sizes (48x48, 128x128)
- `icon-simple.svg` - Simplified version for small sizes (16x16, 32x32)
- `icon-16.png` - Toolbar icon (16x16)
- `icon-32.png` - Toolbar icon @2x (32x32)
- `icon-48.png` - Extension management page (48x48)
- `icon-128.png` - Chrome Web Store & Installation (128x128)

## Design Concept

### Theme
- **Primary Color**: Yellow (#FCD34D) - representing the "Banana" and optimism
- **Accent Color**: Dark Gray (#1F2937) - professional contrast
- **Style**: Modern, playful, tech-forward

### Elements
1. **Banana Shape**: Stylized banana as the core element
2. **AI Sparkles**: Star/sparkle symbols indicating AI functionality
3. **Rounded Corners**: Modern, friendly appearance
4. **High Contrast**: Ensures visibility in light and dark UI modes

## Generating PNG Icons

### Method 1: Using Node.js (Recommended)

```bash
# Install sharp
npm install sharp --save-dev

# Run the generation script
node scripts/generate-icons.js
```

### Method 2: Online Converters

If you don't have Node.js setup, use these online tools:

1. **CloudConvert**: https://cloudconvert.com/svg-to-png
2. **SVG to PNG**: https://svgtopng.com/
3. **Aconvert**: https://www.aconvert.com/image/svg-to-png/

**Steps:**
1. Upload `icon-simple.svg` and generate 16x16 and 32x32 PNG
2. Upload `icon.svg` and generate 48x48 and 128x128 PNG
3. Rename files to match: `icon-16.png`, `icon-32.png`, etc.
4. Place in the `icons/` directory

### Method 3: Using Figma/Design Tools

1. Import SVG files into Figma/Sketch/Adobe XD
2. Export at required sizes with PNG format
3. Ensure "Export at X resolution" is set correctly

## Chrome Extension Requirements

Chrome extensions require PNG format icons in these sizes:

- **16x16**: Browser toolbar (default state)
- **32x32**: Browser toolbar (retina displays)
- **48x48**: Extension management page
- **128x128**: Chrome Web Store listing and installation

## Testing Icons

After generating PNGs:

1. Update `manifest.json` with icon paths
2. Load unpacked extension in Chrome
3. Check visibility in:
   - Toolbar (16x16, 32x32)
   - Extensions page (48x48)
   - Chrome Web Store preview (128x128)

## Color Palette

```css
/* Primary */
--brand-yellow: #FCD34D;
--brand-yellow-dark: #FBBF24;

/* Accent */
--brand-black: #1F2937;

/* Highlights */
--highlight: #FEF3C7;
```

## License

These icons are part of the NanoBanana project and should maintain consistent branding.
