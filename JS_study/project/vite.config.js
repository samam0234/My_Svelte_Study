import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // svelteTesting() : 테스트에서 Svelte가 "브라우저용" 코드로 불러와지게 하고,
  //                   테스트가 끝날 때마다 render()한 컴포넌트를 자동으로 정리(cleanup)해 준다.
  plugins: [svelte(), svelteTesting()],

  // npm test 할 때만 쓰이는 Vitest 설정 (개발 서버·빌드에는 영향 없음)
  test: {
    environment: 'jsdom', // 브라우저 흉내 (document, window ...)
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.{test,spec}.js'],
  },
})
