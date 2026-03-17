const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const path = require('path');
const fs = require('fs');

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...');
  
  const assetsDir = path.join(__dirname, '../src/assets/images');
  const outputDir = path.join(__dirname, '../src/assets/images/optimized');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    // Convert PNG and JPG to WebP
    const files = await imagemin([`${assetsDir}/*.{png,jpg,jpeg}`], {
      destination: outputDir,
      plugins: [
        imageminWebp({
          quality: 75,
          alphaQuality: 100,
          method: 6,
          lossless: false
        })
      ]
    });

    console.log('✅ Images optimized to WebP:');
    files.forEach(file => {
      const originalSize = fs.statSync(file.sourcePath).size;
      const optimizedSize = fs.statSync(file).size;
      const saved = ((1 - optimizedSize / originalSize) * 100).toFixed(2);
      console.log(`   ${path.basename(file.sourcePath)} → ${path.basename(file)} (saved ${saved}%)`);
    });

    console.log(`\n📊 Optimization complete. Check ${outputDir} for WebP versions.`);
    console.log('💡 Tip: Update imports to use WebP versions for better performance.');
    
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    process.exit(1);
  }
}

optimizeImages();
