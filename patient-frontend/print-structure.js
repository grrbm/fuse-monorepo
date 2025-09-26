#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readGitignore(dir) {
  const gitignorePath = path.join(dir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) return [];
  
  return fs.readFileSync(gitignorePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function shouldIgnore(filePath, ignorePatterns, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  
  return ignorePatterns.some(pattern => {
    if (pattern.endsWith('/')) {
      return relativePath.startsWith(pattern) || relativePath === pattern.slice(0, -1);
    }
    return relativePath === pattern || relativePath.includes(pattern);
  });
}

function printDirectory(dir, prefix = '', ignorePatterns = [], baseDir = dir) {
  const items = fs.readdirSync(dir).sort();
  
  items.forEach((item, index) => {
    const itemPath = path.join(dir, item);
    
    if (shouldIgnore(itemPath, ignorePatterns, baseDir)) {
      return;
    }
    
    const isLast = index === items.length - 1;
    const currentPrefix = isLast ? '└── ' : '├── ';
    const nextPrefix = isLast ? '    ' : '│   ';
    
    console.log(prefix + currentPrefix + item);
    
    if (fs.statSync(itemPath).isDirectory()) {
      printDirectory(itemPath, prefix + nextPrefix, ignorePatterns, baseDir);
    }
  });
}

const frontendDir = __dirname;
const ignorePatterns = readGitignore(frontendDir);

console.log('frontend/');
printDirectory(frontendDir, '', ignorePatterns);