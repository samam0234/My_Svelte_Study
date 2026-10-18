import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { config, resetDb } from '../lib/api.js'
import { auth } from '../lib/auth.svelte.js'
import { toasts } from '../lib/toast.svelte.js'

// jsdom에는 Web Animations API(element.animate)가 없어서 Toast의 transition: 이 실패한다.
// 지정한 시간 뒤에 끝난 것처럼 동작시키는 가짜를 테스트 환경에서만 채워 넣는다. (실제 브라우저에는 있음)
Element.prototype.getAnimations ??= () => []
Element.prototype.animate ??= function (_keyframes, options) {
  const duration = typeof options === 'number' ? options : (options?.duration ?? 0)
  const animation = {
    onfinish: null,
    oncancel: null,
    currentTime: 0,
    playState: 'running',
    effect: null,
    finished: new Promise((resolve) => setTimeout(resolve, duration)),
    cancel() {},
    finish() {},
    pause() {},
    play() {},
    reverse() {},
    commitStyles() {},
  }
  setTimeout(() => animation.onfinish?.(), duration)
  return animation
}

// 가짜 백엔드의 지연을 없애 테스트를 빠르게 한다
beforeEach(() => {
  config.latency = 0
})

// 테스트끼리 영향을 주지 않도록 저장소·주소·게시글 DB를 비운다.
// auth, toasts 는 "모듈이 들고 있는 상태(싱글톤)"라서 localStorage만 지워서는 초기화되지 않는다. 직접 비워야 한다.
afterEach(async () => {
  localStorage.clear()
  resetDb()
  auth.logout()
  toasts.length = 0

  location.hash = ''
  // hashchange 이벤트는 비동기로 도착한다. 라우터(svelte-spa-router)는 현재 주소를 모듈 전역에 들고 있으므로,
  // 이벤트가 처리되어 "주소 초기화"가 라우터 상태에 반영될 때까지 기다린 뒤 다음 테스트로 넘어간다.
  await new Promise((resolve) => setTimeout(resolve, 10))
})
