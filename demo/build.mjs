import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const pkg = JSON.parse(read('../package.json'));
const bundle = read('../dist/toastcraft.global.js');
if (bundle.includes('</script')) throw new Error('bundle contains </script');

const repo = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
const github = repo?.replace(/^git\+/, '').replace(/\.git$/, '');
const links = [
  `<a href="https://www.npmjs.com/package/${pkg.name}">npm</a>`,
  github && `<a href="${github}">GitHub</a>`,
  `<a href="${github ? github + '#readme' : `https://www.npmjs.com/package/${pkg.name}`}">Docs</a>`,
].filter(Boolean).join('');

const html = read('./template.html')
  .replace('<!--LINKS-->', '<a href="https://www.npmjs.com/package/toastcraft">npm</a><a href="https://github.com/AnantDuhan/toastcraft">GitHub</a>')
  .replace('/*BUNDLE*/', () => bundle);

// Output to docs/ so GitHub Pages can deploy it as-is.
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
writeFileSync(new URL('../docs/index.html', import.meta.url), html);
writeFileSync(new URL('../docs/.nojekyll', import.meta.url), '');
console.log('Built docs/index.html');
