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

function isTextFile(filePath) {
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.css', '.scss', '.html',
    '.xml', '.yml', '.yaml', '.toml', '.ini', '.env', '.py', '.java', '.c', '.cpp',
    '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
    '.sh', '.bat', '.ps1', '.sql', '.graphql', '.vue', '.svelte', '.config'
  ];
  
  const ext = path.extname(filePath).toLowerCase();
  return textExtensions.includes(ext) || !ext; // include files without extensions
}

function getFilePreview(filePath, maxLines = 300) {
  try {
    if (!fs.statSync(filePath).isFile() || !isTextFile(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const preview = lines.slice(0, maxLines).join('\n');
    
    const truncated = lines.length > maxLines;
    return { preview, truncated, totalLines: lines.length };
  } catch (error) {
    return null;
  }
}

function printDirectoryStructure(dir, prefix = '', ignorePatterns = [], baseDir = dir) {
  const items = fs.readdirSync(dir).sort();
  const filteredItems = items.filter(item => {
    const itemPath = path.join(dir, item);
    return !shouldIgnore(itemPath, ignorePatterns, baseDir);
  });
  
  filteredItems.forEach((item, index) => {
    const itemPath = path.join(dir, item);
    const isLast = index === filteredItems.length - 1;
    const currentPrefix = isLast ? '└── ' : '├── ';
    const nextPrefix = isLast ? '    ' : '│   ';
    
    console.log(prefix + currentPrefix + item);
    
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      printDirectoryStructure(itemPath, prefix + nextPrefix, ignorePatterns, baseDir);
    }
  });
}

function collectFiles(dir, ignorePatterns = [], baseDir = dir, files = []) {
  const items = fs.readdirSync(dir).sort();
  const filteredItems = items.filter(item => {
    const itemPath = path.join(dir, item);
    return !shouldIgnore(itemPath, ignorePatterns, baseDir);
  });
  
  filteredItems.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      collectFiles(itemPath, ignorePatterns, baseDir, files);
    } else if (stats.isFile()) {
      files.push(itemPath);
    }
  });
  
  return files;
}

const projectDir = __dirname;
const ignorePatterns = readGitignore(projectDir);

console.log('PROJECT STRUCTURE WITH FILE PREVIEWS');
console.log('====================================\n');
console.log('Root Directory: ' + path.basename(projectDir));
console.log('Ignored patterns:', ignorePatterns.join(', ') || 'none');
console.log('\n' + '='.repeat(80));
console.log('FILE HIERARCHY:');
console.log('='.repeat(80) + '\n');

console.log('project/');
printDirectoryStructure(projectDir, '', ignorePatterns);

console.log('\n' + '='.repeat(80));
console.log('FILE CONTENTS (First 300 lines of each file):');
console.log('='.repeat(80) + '\n');

// Collect all files and show their previews
const allFiles = collectFiles(projectDir, ignorePatterns, projectDir);
allFiles.forEach(filePath => {
  const preview = getFilePreview(filePath);
  if (preview) {
    console.log('='.repeat(80));
    console.log(`FILE: ${path.relative(projectDir, filePath)}`);
    if (preview.truncated) {
      console.log(`SHOWING: First 300 lines of ${preview.totalLines} total lines`);
    } else {
      console.log(`TOTAL LINES: ${preview.totalLines}`);
    }
    console.log('='.repeat(80));
    console.log(preview.preview);
    console.log('='.repeat(80) + '\n');
  }
});