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
  .replace('<!--LINKS-->', links)
  .replaceAll('npm i toastcraft', `npm i ${pkg.name}`)
  .replace('/*BUNDLE*/', () => bundle);

// Output to site/ so GitHub Pages can deploy it as-is.
mkdirSync(new URL('../site/', import.meta.url), { recursive: true });
writeFileSync(new URL('../site/index.html', import.meta.url), html);
console.log(`site/index.html built for ${pkg.name}@${pkg.version}`);
