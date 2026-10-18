import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import Stepper from '../lessons/study3/Stepper.svelte'

describe('Stepper (study3) — props와 콜백 props', () => {
  it('+ 를 누르면 onchange에 "바뀐 값"을 넘긴다 (스스로 값을 바꾸지는 않는다)', async () => {
    const user = userEvent.setup()
    const onchange = vi.fn() // 호출 기록을 남기는 가짜 함수
    render(Stepper, { props: { value: 3, min: 1, max: 5, onchange } })

    await user.click(screen.getByRole('button', { name: '증가' }))

    expect(onchange).toHaveBeenCalledTimes(1)
    expect(onchange).toHaveBeenCalledWith(4)
    expect(screen.getByText('3')).toBeInTheDocument() // 값은 부모가 바꿔 줄 때까지 그대로
  })

  it('최댓값/최솟값에서는 버튼이 비활성화된다', () => {
    const { unmount } = render(Stepper, { props: { value: 5, min: 1, max: 5 } })
    expect(screen.getByRole('button', { name: '증가' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '감소' })).toBeEnabled()
    unmount()

    render(Stepper, { props: { value: 1, min: 1, max: 5 } })
    expect(screen.getByRole('button', { name: '감소' })).toBeDisabled()
  })

  it('부모가 props를 바꾸면(rerender) 화면이 따라간다', async () => {
    const { rerender } = render(Stepper, { props: { value: 2, max: 3 } })
    expect(screen.getByRole('button', { name: '증가' })).toBeEnabled()

    await rerender({ value: 3 })
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '증가' })).toBeDisabled()
  })

  it('onchange를 넘기지 않아도 오류 없이 동작한다', async () => {
    const user = userEvent.setup()
    render(Stepper, { props: { value: 1 } })
    await user.click(screen.getByRole('button', { name: '증가' })) // onchange?.() 덕분에 안전
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
