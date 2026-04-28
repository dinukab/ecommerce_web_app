const fs = require('fs');
const path = require('path');

const replacements = [
    { search: /blue-600/g, replace: 'brand' },
    { search: /blue-700/g, replace: 'brand-dark' },
    { search: /blue-500/g, replace: 'brand' },
    { search: /blue-50/g, replace: 'brand-light' },
    { search: /blue-100/g, replace: 'brand-light' },
    { search: /blue-800/g, replace: 'brand-dark' },
    { search: /blue-900/g, replace: 'brand-dark' },
    { search: /indigo-600/g, replace: 'brand' },
    { search: /indigo-700/g, replace: 'brand-dark' },
    { search: /indigo-50/g, replace: 'brand-light' },
    { search: /indigo-100/g, replace: 'brand-light' },
    { search: /orange-600/g, replace: 'brand' },
    { search: /orange-700/g, replace: 'brand-dark' },
    { search: /orange-50/g, replace: 'brand-light' },
    { search: /orange-100/g, replace: 'brand-light' },
];

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDir = 'c:\\Users\\ASUS\\Documents\\ecommerce_web_app\\frontend\\src';

walk(targetDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        replacements.forEach(r => {
            content = content.replace(r.search, r.replace);
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    }
});
