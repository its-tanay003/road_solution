import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIMITS = {
  'react-vendor': 500 * 1024,
  'three': 550 * 1024,
  'charts': 400 * 1024,
  'index': 300 * 1024,
}

const distDir = path.join(__dirname, '../dist/assets')

if (!fs.existsSync(distDir)) {
  console.error('❌ dist/assets directory not found. Run npm run build first.')
  process.exit(1)
}

const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'))
let failed = false

console.log('📊 Checking bundle sizes...')

for (const [name, limit] of Object.entries(LIMITS)) {
  const match = files.find(f => f.startsWith(name))
  if (match) {
    const size = fs.statSync(path.join(distDir, match)).size
    if (size > limit) {
      console.error(`❌ ${match}: ${(size/1024).toFixed(0)}kB exceeds ${(limit/1024).toFixed(0)}kB limit`)
      failed = true
    } else {
      console.log(`✅ ${match}: ${(size/1024).toFixed(0)}kB`)
    }
  }
}

if (failed) process.exit(1)
