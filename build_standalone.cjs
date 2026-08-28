const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Generating standalone HTML...');
const distPath = path.join(__dirname, 'dist');
let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');

const assetsPath = path.join(distPath, 'assets');
const files = fs.readdirSync(assetsPath);

const jsFile = files.find(f => f.endsWith('.js'));
const cssFile = files.find(f => f.endsWith('.css'));

if (jsFile) {
  const jsContent = fs.readFileSync(path.join(assetsPath, jsFile), 'utf8');
  html = html.replace(
    new RegExp(`<script type="module" crossorigin src="/assets/${jsFile}"></script>`),
    `<script type="module">\n${jsContent}\n</script>`
  );
}

if (cssFile) {
  const cssContent = fs.readFileSync(path.join(assetsPath, cssFile), 'utf8');
  html = html.replace(
    new RegExp(`<link rel="stylesheet" crossorigin href="/assets/${cssFile}">`),
    `<style>\n${cssContent}\n</style>`
  );
}

fs.writeFileSync(path.join(__dirname, '학부모상담신청시스템.html'), html);
console.log('Successfully generated 학부모상담신청시스템.html');
