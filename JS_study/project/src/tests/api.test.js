// 가짜 백엔드(api.js)의 규칙을 검증한다. "권한은 화면이 아니라 API가 최종 검사한다"는 것이 핵심.
import { describe, it, expect } from 'vitest'
import { listPosts, getPost, createPost, updatePost, deletePost, login, ApiError } from '../lib/api.js'

const hong = { username: 'hong', name: '홍길동' }
const kim = { username: 'kim', name: '김철수' }

describe('login', () => {
  it('올바른 계정이면 사용자 정보를 돌려준다 (비밀번호는 제외)', async () => {
    expect(await login('hong', '1234')).toEqual({ username: 'hong', name: '홍길동' })
  })

  it('틀리면 401', async () => {
    await expect(login('hong', 'wrong')).rejects.toMatchObject({ status: 401 })
    await expect(login('nobody', '1234')).rejects.toBeInstanceOf(ApiError)
  })
})

describe('listPosts', () => {
  it('최신글이 먼저, 한 페이지에 5개, 전체 개수와 페이지 수를 알려 준다', async () => {
    const result = await listPosts()
    expect(result.items).toHaveLength(5)
    expect(result.items[0].id).toBe(12)
    expect(result).toMatchObject({ total: 12, page: 1, totalPages: 3 })
  })

  it('page 지정, 범위를 벗어나면 보정한다', async () => {
    expect((await listPosts({ page: 3 })).items.map((p) => p.id)).toEqual([2, 1])
    expect((await listPosts({ page: 99 })).page).toBe(3)
    expect((await listPosts({ page: 0 })).page).toBe(1)
  })

  it('제목·내용·작성자 이름으로 검색한다 (대소문자 무시)', async () => {
    expect((await listPosts({ q: 'vitest' })).items.map((p) => p.id)).toEqual([10])
    expect((await listPosts({ q: '김철수' })).total).toBe(6) // 짝수 id 6개
    expect((await listPosts({ q: '없는검색어zzz' })).items).toEqual([])
  })

  it('결과가 없어도 totalPages는 1 이상', async () => {
    expect((await listPosts({ q: '없는검색어zzz' })).totalPages).toBe(1)
  })

  it('이미 취소된 요청이면 AbortError', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(listPosts({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('getPost', () => {
  it('조회할 때마다 조회수가 1 증가한다', async () => {
    const first = await getPost(12)
    const second = await getPost(12)
    expect(second.views).toBe(first.views + 1)
  })

  it('없는 글은 404', async () => {
    await expect(getPost(999)).rejects.toMatchObject({ status: 404 })
  })
})

describe('createPost', () => {
  it('로그인한 사용자 이름으로 저장되고 목록 맨 앞에 나타난다', async () => {
    const created = await createPost({ title: ' 새 글 ', content: ' 내용입니다 ' }, hong)
    expect(created).toMatchObject({ id: 13, title: '새 글', content: '내용입니다', author: 'hong', authorName: '홍길동', views: 0 })
    expect((await listPosts()).items[0].id).toBe(13)
  })

  it('로그인하지 않으면 401, 빈 값이면 400', async () => {
    await expect(createPost({ title: 'a', content: 'b' }, null)).rejects.toMatchObject({ status: 401 })
    await expect(createPost({ title: '  ', content: 'b' }, hong)).rejects.toMatchObject({ status: 400 })
    await expect(createPost({ title: 'a', content: '' }, hong)).rejects.toMatchObject({ status: 400 })
  })
})

describe('updatePost / deletePost — 작성자만 가능', () => {
  it('작성자는 수정할 수 있다', async () => {
    const updated = await updatePost(1, { title: '수정됨', content: '수정된 내용' }, hong) // 1번 글은 hong 작성
    expect(updated.title).toBe('수정됨')
    expect((await getPost(1)).title).toBe('수정됨')
  })

  it('다른 사람이 수정/삭제하면 403이고, 글은 그대로다', async () => {
    await expect(updatePost(1, { title: '탈취', content: '탈취' }, kim)).rejects.toMatchObject({ status: 403 })
    await expect(deletePost(1, kim)).rejects.toMatchObject({ status: 403 })
    expect((await getPost(1)).title).not.toBe('탈취')
  })

  it('로그인하지 않으면 401, 없는 글은 404', async () => {
    await expect(deletePost(1, null)).rejects.toMatchObject({ status: 401 })
    await expect(deletePost(999, hong)).rejects.toMatchObject({ status: 404 })
    await expect(updatePost(999, { title: 'a', content: 'b' }, hong)).rejects.toMatchObject({ status: 404 })
  })

  it('삭제하면 목록에서 사라진다', async () => {
    await deletePost(1, hong)
    expect((await listPosts({ page: 3 })).items.map((p) => p.id)).toEqual([2])
    await expect(getPost(1)).rejects.toMatchObject({ status: 404 })
  })
})

describe('저장 (localStorage)', () => {
  it('저장된 데이터가 깨져 있어도 초기 데이터로 복구한다', async () => {
    // 이 키에 일부러 깨진 값을 넣으면 readJson이 fallback(null)을 돌려 → seed로 시작해야 한다
    localStorage.setItem('board-posts', '{깨진')
    expect((await listPosts()).total).toBe(12)
  })
})
