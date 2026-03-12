#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function isGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

if (!isGitRepo()) {
  console.log('install-git-hooks: not a git repository; skipping.')
  process.exit(0)
}

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' })
  console.log('install-git-hooks: set core.hooksPath to .githooks')
} catch (err) {
  console.warn('install-git-hooks: failed to set core.hooksPath, continuing.')
}

const root = path.resolve(__dirname, '..')
const hooksDir = path.join(root, '.githooks')

try {
  if (fs.existsSync(hooksDir)) {
    const items = fs.readdirSync(hooksDir)
    items.forEach(item => {
      const full = path.join(hooksDir, item)
      try {
        if (fs.statSync(full).isFile()) {
          fs.chmodSync(full, 0o755)
        }
      } catch (e) {
        // ignore per-file errors
      }
    })
    console.log('install-git-hooks: ensured hooks are executable.')
  } else {
    console.log('install-git-hooks: .githooks directory not found; skipping chmod.')
  }
} catch (err) {
  console.warn('install-git-hooks: error ensuring hook permissions:', err.message)
}

process.exit(0)
