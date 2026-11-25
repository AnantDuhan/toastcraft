import { defineConfig } from 'vitest/config';
// Only the core package's tests. The Angular adapter in angular/ runs its own suite with `ng test`.
export default defineConfig({ test: { environment: 'happy-dom', include: ['test/**/*.test.ts'] } });
