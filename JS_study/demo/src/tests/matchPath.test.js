// 순수 함수 테스트 : 입력 → 출력만 확인하면 되므로 가장 쉽고 빠르다.
import { describe, it, expect } from 'vitest'
import { matchPath } from '../lessons/study7/custom/router.svelte.js'

describe('matchPath', () => {
  it('이름 있는 파라미터를 뽑아낸다', () => {
    expect(matchPath('/users/:id', '/users/3')).toEqual({ id: '3' })
    expect(matchPath('/a/:x/b/:y', '/a/1/b/2')).toEqual({ x: '1', y: '2' })
  })

  it('파라미터가 없는 패턴은 빈 객체를 돌려준다 (null과 구분)', () => {
    expect(matchPath('/', '/')).toEqual({})
    expect(matchPath('/users', '/users')).toEqual({})
  })

  it('맞지 않으면 null', () => {
    expect(matchPath('/users/:id', '/users')).toBeNull()
    expect(matchPath('/users', '/users/3')).toBeNull()
    expect(matchPath('/users/:id', '/posts/3')).toBeNull()
  })

  it('끝의 슬래시는 무시하고, 인코딩된 값은 복원한다', () => {
    expect(matchPath('/users/:id', '/users/3/')).toEqual({ id: '3' })
    expect(matchPath('/tags/:name', '/tags/%ED%95%9C%EA%B8%80')).toEqual({ name: '한글' })
  })
})
