// 순수 함수 단위 테스트
import { describe, it, expect } from 'vitest'
import { splitByQuery, formatDate } from '../lib/text.js'
import { safeRedirect } from '../lib/redirect.js'

describe('splitByQuery', () => {
  it('검색어가 없으면 통째로 한 조각', () => {
    expect(splitByQuery('Svelte 게시판', '')).toEqual([{ text: 'Svelte 게시판', match: false }])
    expect(splitByQuery('Svelte 게시판', '   ')).toEqual([{ text: 'Svelte 게시판', match: false }])
  })

  it('대소문자를 무시하고 일치 부분을 표시하며, 원래 글자 모양은 보존한다', () => {
    expect(splitByQuery('Svelte 게시판', 'sve')).toEqual([
      { text: 'Sve', match: true },
      { text: 'lte 게시판', match: false },
    ])
  })

  it('여러 번 나오면 모두 표시한다', () => {
    const parts = splitByQuery('ab ab ab', 'ab')
    expect(parts.filter((p) => p.match)).toHaveLength(3)
    expect(parts.map((p) => p.text).join('')).toBe('ab ab ab') // 이어 붙이면 원문과 같다
  })

  it('일치하는 곳이 없으면 통째로 한 조각', () => {
    expect(splitByQuery('hello', 'zzz')).toEqual([{ text: 'hello', match: false }])
  })

  it('정규식 특수문자도 글자 그대로 검색한다', () => {
    expect(splitByQuery('a.b (c)', '.b')).toEqual([
      { text: 'a', match: false },
      { text: '.b', match: true },
      { text: ' (c)', match: false },
    ])
  })
})

describe('formatDate', () => {
  it('한국어 날짜 형식', () => {
    expect(formatDate('2026-10-19T09:00:00')).toBe('2026. 10. 19.')
  })
})

describe('safeRedirect', () => {
  it('앱 안의 경로만 허용한다', () => {
    expect(safeRedirect('/write')).toBe('/write')
    expect(safeRedirect('/posts/3')).toBe('/posts/3')
  })

  it('없거나 위험한 값은 홈으로', () => {
    expect(safeRedirect(null)).toBe('/')
    expect(safeRedirect('')).toBe('/')
    expect(safeRedirect('https://evil.example')).toBe('/')
    expect(safeRedirect('//evil.example')).toBe('/')
    expect(safeRedirect('javascript:alert(1)')).toBe('/')
    expect(safeRedirect('write')).toBe('/')
  })
})
