import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import CustomRouterDemo from '../lessons/study7/custom/CustomRouterDemo.svelte'
import { auth } from '../lessons/study7/auth.svelte.js'

// 해시 라우터는 주소창(location.hash)이 입력이다. 이동은 비동기(hashchange 이벤트)이므로 waitFor로 기다린다.
function goto(hash) {
  location.hash = hash
}

beforeEach(() => {
  auth.user = null
})

describe('직접 만든 해시 라우터 (study7)', () => {
  it('주소에 따라 알맞은 페이지를 보여 주고, 파라미터를 전달한다', async () => {
    render(CustomRouterDemo)
    expect(screen.getByRole('heading', { name: /홈/ })).toBeInTheDocument()

    goto('#/users')
    expect(await screen.findByRole('heading', { name: /사용자 목록/ })).toBeInTheDocument()

    goto('#/users/2')
    expect(await screen.findByRole('heading', { name: /이영희/ })).toBeInTheDocument()

    goto('#/users/99')
    expect(await screen.findByText(/사용자를 찾을 수 없습니다/)).toBeInTheDocument()
  })

  it('맞는 경로가 없으면 404 화면', async () => {
    render(CustomRouterDemo)
    goto('#/없는/주소')
    expect(await screen.findByRole('heading', { name: /404/ })).toBeInTheDocument()
  })

  it('현재 경로의 링크에 aria-current가 붙는다', async () => {
    render(CustomRouterDemo)
    goto('#/users/1')
    await screen.findByRole('heading', { name: /홍길동/ })
    expect(screen.getByRole('link', { name: '사용자' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '홈' })).not.toHaveAttribute('aria-current')
  })

  it('만들어질 때 현재 주소와 맞춘다 (다른 라우터를 쓰다 돌아온 상황)', async () => {
    goto('#/users/3') // 라우터가 화면에 없는 동안 주소가 바뀜
    // hashchange 이벤트는 비동기로 도착한다. 듣는 라우터가 없는 상태에서 이벤트가 "지나가도록" 먼저 흘려보낸다.
    await new Promise((resolve) => setTimeout(resolve, 20))

    render(CustomRouterDemo)
    // 이벤트를 기다리지 않고 "렌더 직후" 곧바로 확인 → 마운트 시 동기화가 없다면 이전 경로가 보인다
    expect(screen.getByRole('heading', { name: /박철수/ })).toBeInTheDocument()
  })

  it('가드: 로그인하지 않고 /admin에 가면 /login으로 보낸다', async () => {
    render(CustomRouterDemo)
    goto('#/admin')
    expect(await screen.findByRole('heading', { name: /로그인/ })).toBeInTheDocument()
    expect(location.hash).toBe('#/login')
  })

  it('로그인하면 /admin이 열리고, 로그아웃하면 홈으로 간다 (로그인 화면이 아니라!)', async () => {
    const user = userEvent.setup()
    render(CustomRouterDemo)

    goto('#/admin')
    await screen.findByRole('heading', { name: /로그인/ })

    await user.type(screen.getByLabelText('이름'), '테스터')
    await user.click(screen.getByRole('button', { name: '로그인' }))
    expect(await screen.findByRole('heading', { name: /관리자 페이지/ })).toBeInTheDocument()
    expect(screen.getByText('테스터')).toBeInTheDocument()

    // 상태 변경(logout) 직후 곧바로 주소를 바꾸는 상황 — 가드의 리다이렉트와 경쟁한다
    await user.click(screen.getByRole('button', { name: '로그아웃' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /홈/ })).toBeInTheDocument())
    expect(location.hash).toBe('#/')
    expect(auth.user).toBeNull()
  })
})
