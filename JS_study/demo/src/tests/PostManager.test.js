import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import PostManager from '../lessons/study8/PostManager.svelte'
import { installFakeFetch } from './fakeApi.js'

let calls

beforeEach(() => {
  vi.unstubAllGlobals()
  calls = installFakeFetch() // 진짜 서버 대신 가짜 서버 사용
})

// 목록의 글 제목들 (폼 안의 li가 아니라 목록의 li만)
const listItems = () => screen.getAllByRole('listitem')

async function fillAndSubmit(user, title, body) {
  await user.type(screen.getByLabelText('제목'), title)
  await user.type(screen.getByLabelText('내용'), body)
  await user.click(screen.getByRole('button', { name: '글 등록' }))
}

describe('PostManager (study8) — 폼 검증, POST, 낙관적 삭제', () => {
  it('처음에는 "불러오는 중" 다음에 글 5개를 보여 준다', async () => {
    render(PostManager)
    expect(screen.getByText('목록을 불러오는 중…')).toBeInTheDocument()

    expect(await screen.findByText('post 1')).toBeInTheDocument()
    expect(listItems()).toHaveLength(5)
  })

  it('잘못된 입력으로 제출하면 오류를 보여 주고 서버에 요청하지 않는다', async () => {
    const user = userEvent.setup()
    render(PostManager)
    await screen.findByText('post 1')

    await user.click(screen.getByRole('button', { name: '글 등록' }))

    expect(screen.getByText('제목은 3자 이상 입력하세요.')).toBeInTheDocument()
    expect(screen.getByText('내용은 10자 이상 입력하세요.')).toBeInTheDocument()
    expect(calls.filter((c) => c.method === 'POST')).toHaveLength(0)
  })

  it('입력칸을 한 번 벗어나기(blur) 전에는 오류를 보여 주지 않는다', async () => {
    const user = userEvent.setup()
    render(PostManager)
    await screen.findByText('post 1')

    await user.type(screen.getByLabelText('제목'), 'a')
    expect(screen.queryByText('제목은 3자 이상 입력하세요.')).not.toBeInTheDocument()

    await user.tab() // 포커스 이동 = blur
    expect(screen.getByText('제목은 3자 이상 입력하세요.')).toBeInTheDocument()
  })

  it('올바르게 제출하면 POST 후 목록 맨 앞에 추가되고 폼이 비워진다', async () => {
    const user = userEvent.setup()
    render(PostManager)
    await screen.findByText('post 1')

    await fillAndSubmit(user, '새 글 제목', '내용은 열 글자를 넘겨야 합니다')

    expect(await screen.findByRole('status')).toHaveTextContent('"새 글 제목" 글을 등록했습니다.')
    const post = calls.find((c) => c.method === 'POST')
    expect(JSON.parse(post.body)).toMatchObject({ title: '새 글 제목', userId: 1 })
    expect(listItems()).toHaveLength(6)
    expect(listItems()[0]).toHaveTextContent('새 글 제목')
    expect(screen.getByLabelText('제목')).toHaveValue('')
  })

  it('삭제는 응답을 기다리지 않고 먼저 화면에서 사라진다 (낙관적 업데이트)', async () => {
    const user = userEvent.setup()
    render(PostManager)
    await screen.findByText('post 1')

    await user.click(within(listItems()[0]).getByRole('button', { name: '삭제' }))

    expect(listItems()).toHaveLength(4)
    expect(screen.queryByText('post 1')).not.toBeInTheDocument()
  })

  it('삭제 요청이 실패하면 되돌리고 안내한다 (롤백)', async () => {
    const user = userEvent.setup()
    render(PostManager)
    await screen.findByText('post 1')

    await user.click(screen.getByLabelText('저장/삭제 요청 실패 시뮬레이션'))
    await user.click(within(listItems()[0]).getByRole('button', { name: '삭제' }))

    expect(await screen.findByRole('status')).toHaveTextContent('되돌렸습니다')
    expect(listItems()).toHaveLength(5)
    expect(screen.getByText('post 1')).toBeInTheDocument()
  })

  it('등록 요청이 실패하면 오류를 보여 주고 입력은 그대로 둔다', async () => {
    const user = userEvent.setup()
    render(PostManager)
    await screen.findByText('post 1')

    await user.click(screen.getByLabelText('저장/삭제 요청 실패 시뮬레이션'))
    await fillAndSubmit(user, '실패할 글', '이 요청은 서버에서 거부됩니다')

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 404')
    expect(screen.getByLabelText('제목')).toHaveValue('실패할 글') // 다시 시도할 수 있게 유지
    expect(screen.getByRole('button', { name: '글 등록' })).toBeEnabled() // finally에서 복구
  })
})
