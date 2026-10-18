import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import PostForm from '../components/PostForm.svelte'

const title = () => screen.getByLabelText('제목')
const content = () => screen.getByLabelText('내용')

describe('PostForm', () => {
  it('initial 값으로 시작한다', () => {
    render(PostForm, { props: { initial: { title: '기존 제목', content: '기존 내용입니다' } } })
    expect(title()).toHaveValue('기존 제목')
    expect(content()).toHaveValue('기존 내용입니다')
  })

  it('입력칸을 벗어나기 전에는 오류를 숨기고, 벗어나면 보여 준다', async () => {
    const user = userEvent.setup()
    render(PostForm)

    await user.type(title(), 'a')
    expect(screen.queryByText('제목은 2자 이상 입력하세요.')).not.toBeInTheDocument()

    await user.tab()
    expect(screen.getByText('제목은 2자 이상 입력하세요.')).toBeInTheDocument()

    await user.type(title(), 'b') // 고치면 오류가 사라진다 (오류는 입력값에서 "계산"되므로)
    expect(screen.queryByText('제목은 2자 이상 입력하세요.')).not.toBeInTheDocument()
  })

  it('검증에 실패하면 제출 함수를 호출하지 않고 모든 오류를 보여 준다', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn()
    render(PostForm, { props: { onsubmit, submitLabel: '등록' } })

    await user.click(screen.getByRole('button', { name: '등록' }))

    expect(onsubmit).not.toHaveBeenCalled()
    expect(screen.getByText('제목은 2자 이상 입력하세요.')).toBeInTheDocument()
    expect(screen.getByText('내용은 5자 이상 입력하세요.')).toBeInTheDocument()
  })

  it('통과하면 공백을 다듬은 값으로 onsubmit을 호출한다', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn().mockResolvedValue(undefined)
    render(PostForm, { props: { onsubmit, submitLabel: '등록' } })

    await user.type(title(), '  제목입니다  ')
    await user.type(content(), '  내용이 충분히 깁니다  ')
    await user.click(screen.getByRole('button', { name: '등록' }))

    expect(onsubmit).toHaveBeenCalledTimes(1)
    expect(onsubmit).toHaveBeenCalledWith({ title: '제목입니다', content: '내용이 충분히 깁니다' })
  })

  it('제출 중에는 버튼이 잠기고 중복 제출되지 않는다', async () => {
    const user = userEvent.setup()
    let finish: () => void = () => {}
    const onsubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(PostForm, { props: { onsubmit, submitLabel: '등록' } })

    await user.type(title(), '제목입니다')
    await user.type(content(), '내용이 충분히 깁니다')
    await user.click(screen.getByRole('button', { name: '등록' }))

    const busy = screen.getByRole('button', { name: '저장 중…' })
    expect(busy).toBeDisabled()
    await user.click(busy) // 더블 클릭해도
    expect(onsubmit).toHaveBeenCalledTimes(1)

    finish()
    expect(await screen.findByRole('button', { name: '등록' })).toBeEnabled()
  })

  it('onsubmit이 던진 오류를 폼 아래에 보여 주고, 입력은 유지한다', async () => {
    const user = userEvent.setup()
    const onsubmit = vi.fn().mockRejectedValue(new Error('서버가 거부했습니다.'))
    render(PostForm, { props: { onsubmit, submitLabel: '등록' } })

    await user.type(title(), '제목입니다')
    await user.type(content(), '내용이 충분히 깁니다')
    await user.click(screen.getByRole('button', { name: '등록' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('서버가 거부했습니다.')
    expect(title()).toHaveValue('제목입니다')
    expect(screen.getByRole('button', { name: '등록' })).toBeEnabled()
  })
})
