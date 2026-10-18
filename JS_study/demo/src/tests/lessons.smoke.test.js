// 스모크 테스트 : "일단 켜 보면 연기(smoke)가 나지 않는가" — 모든 실습 화면이 오류 없이 렌더링되는지만 확인한다.
// 문법 오류, 잘못된 import, 초기화 중 예외 같은 큰 사고를 가장 싸게 잡아 준다.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { lessons } from '../lessons/index.js'
import { installFakeFetch } from './fakeApi.js'

beforeEach(() => {
  vi.unstubAllGlobals()
  installFakeFetch() // study8이 진짜 인터넷에 접속하지 않도록
})

describe('모든 실습 화면', () => {
  it('실습이 1개 이상 등록되어 있고 id가 중복되지 않는다', () => {
    expect(lessons.length).toBeGreaterThan(0)
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length)
  })

  it.each(lessons.map((l) => [l.id, l]))('%s 이(가) 오류 없이 렌더링된다', (_id, lesson) => {
    const { container } = render(lesson.component)
    expect(container.querySelector('h2')).not.toBeNull()
  })
})
