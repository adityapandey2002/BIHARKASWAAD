/**
 * copy-build.js
 * Cross-platform script to copy the React production build
 * from client/build/ into server/public/ after `npm run build`
 *
 * Works on both Windows (Hostinger Connector) and Linux (Hostinger VPS/Web Apps)
 */

const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'client', 'build');
const DEST   = path.join(__dirname, '..', 'server', 'public');

function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean destination first
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true, force: true });
  console.log('🗑️  Cleaned old server/public/');
}

if (!fs.existsSync(SOURCE)) {
  console.error('❌ client/build/ not found! Run: cd client && npm run build');
  process.exit(1);
}

copyDir(SOURCE, DEST);
console.log('✅ React build copied to server/public/');
console.log('   Ready for production deployment.');
