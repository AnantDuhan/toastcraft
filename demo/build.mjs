import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const bundle = read('../dist/toastcraft.global.js');
if (bundle.includes('</script')) throw new Error('bundle contains </script');

// npm and Docs hrefs are swapped by the page when the framework switch changes.
const links =
  '<a id="npmLink" href="https://www.npmjs.com/package/toastcraft">npm</a>' +
  '<a href="https://github.com/AnantDuhan/toastcraft">GitHub</a>' +
  '<a id="docsLink" href="https://github.com/AnantDuhan/toastcraft#readme">Docs</a>';

const write = (path, html) => {
  const url = new URL(`../docs/${path}`, import.meta.url);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, html);
  console.log(`Built docs/${path}`);
};

write('index.html', read('./template.html').replace('<!--LINKS-->', links).replace('/*BUNDLE*/', () => bundle));
write('migrate-from-ngx-toastr/index.html', read('./migrate.html').replace('/*BUNDLE*/', () => bundle));
writeFileSync(new URL('../docs/.nojekyll', import.meta.url), '');
