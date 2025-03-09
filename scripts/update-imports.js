/**
 * Script to update import paths after refactoring the utils folder structure
 * 
 * Usage:
 * node scripts/update-imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map of old imports to new imports
const importMap = {
  '@/app/utils/db': '@/app/utils/db/prisma',
  '@/app/utils/requireUser': '@/app/utils/auth/user',
  '@/app/utils/constants': '@/app/utils/constants/images',
  '@/app/utils/UploadthingComponents': '@/app/utils/upload/uploadthing',
  '@/app/utils/zodSchemas': '@/app/utils/validation',
  '../../utils/db': '../../utils/db/prisma',
  '../../utils/requireUser': '../../utils/auth/user',
  '../../utils/constants': '../../utils/constants/images',
  '../../utils/UploadthingComponents': '../../utils/upload/uploadthing',
  '../../utils/zodSchemas': '../../utils/validation',
  '../utils/db': '../utils/db/prisma',
  '../utils/requireUser': '../utils/auth/user',
  '../utils/constants': '../utils/constants/images',
  '../utils/UploadthingComponents': '../utils/upload/uploadthing',
  '../utils/zodSchemas': '../utils/validation',
};

// Specific schema imports
const schemaImportMap = {
  'SiteCreationSchema': '@/app/utils/validation/siteSchema',
  'siteSchema': '@/app/utils/validation/siteSchema',
  'PostCreationSchema': '@/app/utils/validation/postSchema',
  'PostEditSchema': '@/app/utils/validation/postSchema',
  'PostSchema': '@/app/utils/validation/postSchema',
};

// Find all TypeScript files in the project
const findTsFiles = () => {
  try {
    const result = execSync('find app -type f -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' });
    return result.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding TypeScript files:', error);
    return [];
  }
};

// Update imports in a file
const updateImportsInFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace general imports
    for (const [oldImport, newImport] of Object.entries(importMap)) {
      const regex = new RegExp(`import (.+) from ['"]${oldImport}['"]`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `import $1 from '${newImport}'`);
        modified = true;
      }
    }

    // Replace specific schema imports
    for (const [schema, newImport] of Object.entries(schemaImportMap)) {
      const regex = new RegExp(`import {([^}]*${schema}[^}]*)} from ['"]@/app/utils/zodSchemas['"]`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, (match, imports) => {
          // Check if there are other imports from zodSchemas
          const otherImports = imports.split(',')
            .map(i => i.trim())
            .filter(i => i !== schema && i !== '');
          
          if (otherImports.length === 0) {
            return `import { ${schema} } from '${newImport}'`;
          } else {
            // Keep other imports from zodSchemas
            return `import { ${schema} } from '${newImport}';\nimport { ${otherImports.join(', ')} } from '@/app/utils/validation'`;
          }
        });
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating imports in ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  const files = findTsFiles();
  console.log(`Found ${files.length} TypeScript files`);
  
  files.forEach(updateImportsInFile);
  
  console.log('Import paths update completed');
};

main(); 