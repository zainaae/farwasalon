/**
 * Surgically rebuild stale sections of .tmp-design-system/_ds_bundle.js
 * from current JSX sources (ProofStrip, ReviewProof, Home, Services, Book, Shared).
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { transformSync } from '@babel/core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const bundlePath = path.join(root, '_ds_bundle.js')

const SCOPE_EXPORT = {
  'components/chrome/ProofStrip.jsx': 'ProofStrip',
  'components/chrome/ReviewProof.jsx': 'ReviewProof',
}

const WINDOW_ASSIGN = {
  'ui_kits/website/Home.jsx': true,
  'ui_kits/website/Services.jsx': true,
  'ui_kits/website/Book.jsx': true,
  'ui_kits/website/Shared.jsx': true,
}

function stripImports(src) {
  return src
    .replace(/^import\s+React\s+from\s+['"]react['"]\s*;?\s*/m, '')
    .replace(/^import\s+.*?from\s+['"].*?['"]\s*;?\s*/gm, '')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+\{[^}]+\}\s*;?\s*/gm, '')
}

function compile(sourcePath, code) {
  const stripped = stripImports(code)
  const result = transformSync(stripped, {
    filename: sourcePath,
    presets: [
      [
        '@babel/preset-react',
        { runtime: 'classic', development: false },
      ],
    ],
    babelrc: false,
    configFile: false,
  })
  if (!result?.code) throw new Error(`Babel failed for ${sourcePath}`)
  return result.code
}

function wrapSection(sourcePath, compiled) {
  const exportName = SCOPE_EXPORT[sourcePath]
  let body = compiled.trim()
  if (exportName) {
    // Sources use `export function X` — after strip + babel it becomes `function X`
    // Ensure Object.assign into __ds_scope
    if (!body.includes(`Object.assign(__ds_scope, { ${exportName} })`)) {
      body += `\nObject.assign(__ds_scope, { ${exportName} });`
    }
  }
  return `// ${sourcePath}\ntry { (() => {\n${body}\n})(); } catch (e) { __ds_ns.__errors.push({ path: ${JSON.stringify(sourcePath)}, error: String((e && e.message) || e) }); }\n`
}

function replaceSection(bundle, sourcePath, newSection) {
  const marker = `// ${sourcePath}`
  const start = bundle.indexOf(marker)
  if (start < 0) throw new Error(`Section not found: ${sourcePath}`)
  // Find next section marker or end of IIFE assignments area
  const after = bundle.indexOf('\n// ', start + marker.length)
  // Also watch for `__ds_ns.Navbar =` export block near end of components
  let end = after
  if (end < 0) end = bundle.length
  // Prefer next `// path` style comment at line start
  const rest = bundle.slice(start + 1)
  const nextMatch = rest.match(/\n\/\/ (?:components|ui_kits)\//)
  if (nextMatch) {
    end = start + 1 + nextMatch.index + 1
  }
  return bundle.slice(0, start) + newSection + bundle.slice(end)
}

function hash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12)
}

const targets = [
  'components/chrome/ProofStrip.jsx',
  'components/chrome/ReviewProof.jsx',
  'ui_kits/website/Book.jsx',
  'ui_kits/website/Home.jsx',
  'ui_kits/website/Services.jsx',
  'ui_kits/website/Shared.jsx',
]

let bundle = fs.readFileSync(bundlePath, 'utf8')
const hashes = {}

for (const rel of targets) {
  const abs = path.join(root, rel)
  const src = fs.readFileSync(abs, 'utf8')
  hashes[rel] = hash(src)
  const compiled = compile(rel, src)
  const section = wrapSection(rel, compiled)
  bundle = replaceSection(bundle, rel, section)
  console.log('updated', rel)
}

// Patch sourceHashes in header if present
bundle = bundle.replace(
  /"sourceHashes":\{[^}]+\}/,
  (m) => {
    let obj
    try {
      obj = JSON.parse('{' + m.replace(/^"sourceHashes":/, '"sourceHashes":').slice(0) + '}')
    } catch {
      return m
    }
    // simpler: regex-replace each key
    return m
  },
)

for (const [rel, h] of Object.entries(hashes)) {
  const re = new RegExp(`("${rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":")[a-f0-9]+(")`)
  bundle = bundle.replace(re, `$1${h}$2`)
}

// Expose updated exports at end if needed — ProofStrip/ReviewProof already assigned in section
fs.writeFileSync(bundlePath, bundle)
console.log('wrote', bundlePath)

// Verify no Quoti dress leftovers
const bad = ['More glow', 'plum-gradient', '380 Google']
for (const b of bad) {
  if (bundle.includes(b)) console.warn('STILL CONTAINS:', b)
  else console.log('clean of:', b)
}
