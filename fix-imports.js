const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      content = content.replace(/import Card from '@\/components\/ui\/Card';/g, "import { Card } from '@/components/ui/Card';");
      content = content.replace(/import Button from '@\/components\/ui\/Button';/g, "import { Button } from '@/components/ui/Button';");
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

walk('d:/EDU/edu-app/src');
