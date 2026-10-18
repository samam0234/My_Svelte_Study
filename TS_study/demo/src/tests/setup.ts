// 모든 테스트 파일이 실행되기 전에 한 번 실행되는 준비 파일
import '@testing-library/jest-dom/vitest' // toBeInTheDocument(), toHaveTextContent() 같은 matcher 추가 (타입 포함)
import { afterEach } from 'vitest'

// ── jsdom에 없는 브라우저 API 보완 ───────────────────────────────────────
// jsdom은 브라우저를 "흉내"낸 것이라 일부 API가 없다. 실제 브라우저에는 모두 있으므로 테스트 환경에서만 채운다.
// (TS에서는 "있다고 가정된" 타입에 값을 채우는 것이므로 as unknown as 로 타입을 맞춰 준다)

// svelte/motion의 prefersReducedMotion 이 사용
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

// bind:clientWidth 등이 사용
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// transition:, animate: 가 사용하는 Web Animations API. 지정한 시간 뒤에 끝난 것처럼 동작시킨다.
interface FakeAnimation {
  onfinish: (() => void) | null
  oncancel: (() => void) | null
  currentTime: number
  playState: string
  effect: null
  finished: Promise<void>
  cancel(): void
  finish(): void
  pause(): void
  play(): void
  reverse(): void
  commitStyles(): void
}

Element.prototype.getAnimations ??= () => []
Element.prototype.animate ??= function (_keyframes: unknown, options?: number | KeyframeAnimationOptions) {
  const duration = typeof options === 'number' ? options : Number(options?.duration ?? 0)
  const animation: FakeAnimation = {
    onfinish: null,
    oncancel: null,
    currentTime: 0,
    playState: 'running',
    effect: null,
    finished: new Promise<void>((resolve) => setTimeout(resolve, duration)),
    cancel() {},
    finish() {},
    pause() {},
    play() {},
    reverse() {},
    commitStyles() {},
  }
  setTimeout(() => animation.onfinish?.(), duration)
  return animation as unknown as Animation
}

// 테스트끼리 영향을 주지 않도록 매번 저장소와 주소 해시를 비운다
afterEach(() => {
  localStorage.clear()
  location.hash = ''
})
