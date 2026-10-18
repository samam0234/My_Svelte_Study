import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import TodoList from '../lessons/study4/TodoList.svelte'

// 초기 데이터: 'Svelte 설치하기'(완료), '$state 익히기'(완료), '리스트 렌더링 연습'(진행 중)

describe('TodoList (study4)', () => {
  it('초기 목록과 남은 개수를 보여 준다', () => {
    render(TodoList)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('남은 일 1개')).toBeInTheDocument()
  })

  it('입력하고 추가하면 목록 끝에 생기고 입력창이 비워진다', async () => {
    const user = userEvent.setup()
    render(TodoList)

    const input = screen.getByPlaceholderText('할 일을 입력')
    await user.type(input, '테스트 작성하기')
    await user.click(screen.getByRole('button', { name: '추가' }))

    expect(screen.getByText('테스트 작성하기')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('남은 일 2개')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('공백만 입력하면 추가되지 않는다', async () => {
    const user = userEvent.setup()
    render(TodoList)
    await user.type(screen.getByPlaceholderText('할 일을 입력'), '   ')
    await user.click(screen.getByRole('button', { name: '추가' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('필터: 완료 / 진행 중 / 전체', async () => {
    const user = userEvent.setup()
    render(TodoList)

    await user.click(screen.getByRole('button', { name: '완료' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: '진행 중' }))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('리스트 렌더링 연습')

    await user.click(screen.getByRole('button', { name: '전체' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('체크하면 남은 개수가 줄고 "진행 중" 목록에서 사라진다', async () => {
    const user = userEvent.setup()
    render(TodoList)

    await user.click(screen.getByRole('button', { name: '진행 중' }))
    await user.click(within(screen.getByRole('listitem')).getByRole('checkbox'))

    expect(screen.getByText('남은 일 0개')).toBeInTheDocument()
    // 진행 중 목록이 비었으므로 빈 상태 문구가 보인다
    expect(screen.getByText('표시할 항목이 없습니다.')).toBeInTheDocument()
  })

  it('삭제', async () => {
    const user = userEvent.setup()
    render(TodoList)
    await user.click(screen.getAllByRole('button', { name: '삭제' })[0])
    expect(screen.queryByText('Svelte 설치하기')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
