import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import BuildInfo from '../lessons/study10/BuildInfo.svelte'

describe('BuildInfo (study10)', () => {
  it('테스트 실행 중에는 MODE가 test이고 .env의 VITE_ 변수를 읽는다', () => {
    const { container } = render(BuildInfo)
    // Vitest는 MODE를 'test'로 설정한다 (dev 서버는 development, build는 production)
    expect(container.querySelector('[data-key=MODE]')).toHaveTextContent('test')
    expect(container.querySelector('[data-key=VITE_APP_TITLE]')).toHaveTextContent('Svelte 학습')
    expect(screen.getByText('BASE_URL')).toBeInTheDocument()
  })
})
