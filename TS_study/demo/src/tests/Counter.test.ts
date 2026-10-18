import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import Counter from '../lessons/study2/Counter.svelte'

// Testing Library의 철학 : "구현"이 아니라 "사용자가 보고 누르는 방식"으로 테스트한다.
//  → 변수 이름이 아니라 화면의 역할(role)·글자(text)로 요소를 찾는다.

describe('Counter (study2)', () => {
  it('처음에는 0이 보인다', () => {
    render(Counter)
    expect(screen.getByText('0', { selector: 'strong' })).toBeInTheDocument()
  })

  it('+ 버튼을 누르면 step만큼 증가하고, 리셋하면 0으로 돌아간다', async () => {
    const user = userEvent.setup()
    render(Counter)

    await user.click(screen.getByRole('button', { name: '+ 1' }))
    await user.click(screen.getByRole('button', { name: '+ 1' }))
    expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '리셋' }))
    expect(screen.getByText('0', { selector: 'strong' })).toBeInTheDocument()
  })

  it('step을 바꾸면 버튼 이름과 증가량이 바뀐다', async () => {
    const user = userEvent.setup()
    render(Counter)

    const step = screen.getByRole('spinbutton') // <input type="number">
    await user.clear(step)
    await user.type(step, '5')

    await user.click(screen.getByRole('button', { name: '+ 5' }))
    expect(screen.getByText('5', { selector: 'strong' })).toBeInTheDocument()
  })
})
