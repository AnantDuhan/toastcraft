import { readFileSync, writeFileSync } from 'node:fs';
const bundle = readFileSync(new URL('../dist/toastcraft.global.js', import.meta.url), 'utf8');
if (bundle.includes('</script')) throw new Error('bundle contains </script');
const html = readFileSync(new URL('./template.html', import.meta.url), 'utf8').replace('/*BUNDLE*/', () => bundle);
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('demo/index.html', html.length, 'bytes');
