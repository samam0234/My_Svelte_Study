import { describe, it, expect, vi, afterEach } from 'vitest'
import { clickOutside, autofocus, longpress } from '../lessons/study9/lib/actions.js'

// 액션은 "DOM 요소 + 매개변수 → { update, destroy }" 형태의 함수라서 컴포넌트 없이도 직접 호출해 테스트할 수 있다.

function makeBox() {
  const box = document.createElement('div')
  const inner = document.createElement('button')
  box.append(inner)
  document.body.append(box)
  return { box, inner }
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('clickOutside', () => {
  it('바깥 클릭에만 호출된다', () => {
    const { box, inner } = makeBox()
    const callback = vi.fn()
    clickOutside(box, callback)

    inner.click() // 안쪽
    expect(callback).not.toHaveBeenCalled()

    document.body.click() // 바깥
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('update로 콜백을 바꾸고, destroy 후에는 호출되지 않는다', () => {
    const { box } = makeBox()
    const first = vi.fn()
    const second = vi.fn()
    const action = clickOutside(box, first)

    action.update(second)
    document.body.click()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)

    action.destroy() // 리스너 정리
    document.body.click()
    expect(second).toHaveBeenCalledTimes(1)
  })
})

describe('autofocus', () => {
  it('포커스를 주고 select 옵션이면 내용을 선택한다', () => {
    const input = document.createElement('input')
    input.value = 'hello'
    document.body.append(input)

    autofocus(input, { select: true })
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(5)
  })
})

describe('longpress', () => {
  it('기준 시간 이상 누르면 호출, 그 전에 떼면 호출되지 않는다', () => {
    vi.useFakeTimers() // 시간을 직접 흘려보낸다 (실제로 기다리지 않는다)
    const { box } = makeBox()
    const onlongpress = vi.fn()
    longpress(box, { duration: 500, onlongpress })

    box.dispatchEvent(new Event('pointerdown'))
    vi.advanceTimersByTime(300)
    box.dispatchEvent(new Event('pointerup'))
    vi.advanceTimersByTime(1000)
    expect(onlongpress).not.toHaveBeenCalled()

    box.dispatchEvent(new Event('pointerdown'))
    vi.advanceTimersByTime(500)
    expect(onlongpress).toHaveBeenCalledTimes(1)
  })

  it('update로 기준 시간을 바꾸면 새 값이 적용된다', () => {
    vi.useFakeTimers()
    const { box } = makeBox()
    const onlongpress = vi.fn()
    const action = longpress(box, { duration: 500, onlongpress })

    action.update({ duration: 1000, onlongpress })
    box.dispatchEvent(new Event('pointerdown'))
    vi.advanceTimersByTime(600)
    expect(onlongpress).not.toHaveBeenCalled()
    vi.advanceTimersByTime(400)
    expect(onlongpress).toHaveBeenCalledTimes(1)
  })
})
