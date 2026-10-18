// 통합 테스트 : 앱 전체(App.svelte)를 렌더링하고 실제 사용자가 하는 순서대로 조작한다.
// 라우터, 가드, 가짜 API, 스토어, 토스트가 함께 동작하는지 확인한다.
import { describe, it, expect } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import App from '../App.svelte'

// 주소를 직접 바꾸는 것 = 북마크/링크로 들어오거나 새로고침한 상황
const visit = (hash) => {
  location.hash = hash
}

// 목록의 글 제목(링크)들
const titles = () => within(screen.getByRole('list')).getAllByRole('link').map((a) => a.textContent.trim())

async function loginAs(user, username = 'hong') {
  // 라우터는 페이지 컴포넌트를 비동기로 그리므로 첫 입력칸은 findBy로 기다린다
  await user.type(await screen.findByLabelText('아이디'), username)
  await user.type(screen.getByLabelText('비밀번호'), '1234')
  await user.click(screen.getByRole('button', { name: '로그인' }))
}

describe('목록 · 검색 · 페이지네이션', () => {
  it('최신글 5개와 전체 건수, 페이지 링크를 보여 준다', async () => {
    render(App)
    expect(await screen.findByText('미니 게시판 만들기 시작!')).toBeInTheDocument()

    expect(titles()).toEqual([
      '미니 게시판 만들기 시작!',
      'SvelteKit 은 언제 쓰나요',
      'Vitest 로 컴포넌트 테스트하기',
      'transition 과 animate:flip',
      'fetch 와 AbortController',
    ])
    expect(screen.getByText('총 12건')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('aria-current', 'page')
  })

  it('검색하면 주소에 q가 담기고, 일치하는 글자는 <mark>로 강조된다', async () => {
    const user = userEvent.setup()
    render(App)
    await screen.findByText('미니 게시판 만들기 시작!')

    await user.type(screen.getByRole('searchbox', { name: '검색어' }), 'vitest')
    await user.click(screen.getByRole('button', { name: '검색' }))

    await waitFor(() => expect(titles()).toEqual(['Vitest 로 컴포넌트 테스트하기']))
    expect(location.hash).toBe('#/?q=vitest')
    expect(screen.getByText('Vitest', { selector: 'mark' })).toBeInTheDocument() // 원래 글자(대문자) 보존
    expect(screen.getByText('총 1건')).toBeInTheDocument()
  })

  it('결과가 없으면 안내 문구를, 초기화하면 전체 목록을 보여 준다', async () => {
    const user = userEvent.setup()
    render(App)
    await screen.findByText('미니 게시판 만들기 시작!')

    await user.type(screen.getByRole('searchbox', { name: '검색어' }), '없는검색어zzz')
    await user.click(screen.getByRole('button', { name: '검색' }))
    expect(await screen.findByText('"없는검색어zzz"에 해당하는 글이 없습니다.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '초기화' }))
    expect(await screen.findByText('미니 게시판 만들기 시작!')).toBeInTheDocument()
    expect(location.hash).toBe('#/')
  })

  it('다음 페이지로 이동하면 주소에 page가 담긴다', async () => {
    const user = userEvent.setup()
    render(App)
    await screen.findByText('미니 게시판 만들기 시작!')

    await user.click(screen.getByRole('link', { name: '다음' }))

    expect(await screen.findByText('해시 라우터 직접 만들어 보기')).toBeInTheDocument()
    expect(location.hash).toBe('#/?page=2')
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
  })

  it('주소로 바로 들어와도(검색어 + 페이지) 그 상태가 복원된다', async () => {
    visit('#/?q=e&page=2') // 영문 'e'가 들어간 글은 9건 → 2페이지에 4건
    render(App)

    // 'e'가 <mark>로 강조되어 글자가 여러 요소로 쪼개지므로, 이어 붙인 "접근 가능한 이름"으로 찾는다
    expect(await screen.findByRole('link', { name: 'Svelte 5 룬(rune) 정리' })).toBeInTheDocument()
    expect(titles()).toEqual([
      'snippet 으로 컴포넌트 합성하기',
      '{#each} 에서 key 가 중요한 이유',
      'Vue와 Svelte 비교 후기',
      'Svelte 5 룬(rune) 정리',
    ])
    expect(screen.getByRole('searchbox', { name: '검색어' })).toHaveValue('e') // 입력창도 복원
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('총 9건')).toBeInTheDocument()
  })
})

describe('상세', () => {
  it('글을 열면 내용과 조회수를 보여 준다 (로그인하지 않으면 수정/삭제 없음)', async () => {
    const user = userEvent.setup()
    render(App)
    await user.click(await screen.findByRole('link', { name: '미니 게시판 만들기 시작!' }))

    expect(await screen.findByRole('heading', { name: '미니 게시판 만들기 시작!', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/지금까지 배운 것을 모아서/)).toBeInTheDocument()
    expect(screen.getByText(/조회 9/)).toBeInTheDocument() // 시드 8 + 이번 조회 1
    expect(screen.queryByRole('link', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })

  it('없는 글이면 오류 화면', async () => {
    visit('#/posts/999')
    render(App)
    expect(await screen.findByRole('heading', { name: /글을 불러오지 못했습니다/ })).toBeInTheDocument()
    expect(screen.getByText('존재하지 않는 게시글입니다.')).toBeInTheDocument()
  })

  it('알 수 없는 주소는 404', async () => {
    visit('#/없는/주소')
    render(App)
    expect(await screen.findByRole('heading', { name: '🚫 404' })).toBeInTheDocument()
  })
})

describe('로그인 · 가드', () => {
  it('로그인하지 않고 /write에 가면 로그인 화면으로 보내고, 로그인하면 원래 가려던 /write로 돌아온다', async () => {
    const user = userEvent.setup()
    visit('#/write')
    render(App)

    expect(await screen.findByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(location.hash).toBe('#/login?redirect=%2Fwrite')

    await loginAs(user)

    expect(await screen.findByRole('heading', { name: '글쓰기' })).toBeInTheDocument()
    expect(screen.getByText('홍길동')).toBeInTheDocument() // 헤더에 이름 표시
    expect(location.hash).toBe('#/write')
  })

  it('틀린 비밀번호면 오류를 보여 주고 비밀번호 칸을 비운다', async () => {
    const user = userEvent.setup()
    visit('#/login')
    render(App)

    await user.type(await screen.findByLabelText('아이디'), 'hong')
    await user.type(screen.getByLabelText('비밀번호'), 'wrong')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('아이디 또는 비밀번호가 올바르지 않습니다.')
    expect(screen.getByLabelText('비밀번호')).toHaveValue('')
    expect(screen.queryByText('홍길동')).not.toBeInTheDocument()
  })

  it('악성 redirect 값은 무시하고 홈으로 보낸다', async () => {
    const user = userEvent.setup()
    visit('#/login?redirect=https%3A%2F%2Fevil.example')
    render(App)

    await user.type(await screen.findByLabelText('아이디'), 'hong')
    await user.type(screen.getByLabelText('비밀번호'), '1234')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByRole('heading', { name: '글 목록' })).toBeInTheDocument()
    expect(location.hash).toBe('#/')
  })

  it('로그아웃하면 이름이 사라지고 로그인 링크가 나타난다', async () => {
    const user = userEvent.setup()
    visit('#/login')
    render(App)
    await loginAs(user, 'kim')
    expect(await screen.findByText('김철수')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '로그아웃' }))

    expect(await screen.findByRole('link', { name: '로그인' })).toBeInTheDocument()
    expect(screen.queryByText('김철수')).not.toBeInTheDocument()
  })
})

describe('글쓰기 · 수정 · 삭제 (작성자만)', () => {
  it('글을 쓰면 상세로 이동하고, 작성자에게는 수정/삭제가 보이며, 삭제하면 목록에서 사라진다', async () => {
    const user = userEvent.setup()
    visit('#/login?redirect=%2Fwrite')
    render(App)
    await loginAs(user)

    await screen.findByRole('heading', { name: '글쓰기' })
    await user.type(screen.getByLabelText('제목'), '통합 테스트로 쓴 글')
    await user.type(screen.getByLabelText('내용'), '이 글은 테스트가 작성했습니다.')
    await user.click(screen.getByRole('button', { name: '등록' }))

    // 상세 화면 + 토스트
    expect(await screen.findByRole('heading', { name: '통합 테스트로 쓴 글', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: '알림' })).toHaveTextContent('글을 등록했습니다.')
    expect(location.hash).toBe('#/posts/13')
    expect(screen.getByRole('link', { name: '수정' })).toBeInTheDocument()

    // 삭제는 두 단계 (실수 방지)
    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(screen.getByText('정말 삭제할까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '삭제 확인' }))

    expect(await screen.findByRole('heading', { name: '글 목록' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: '알림' })).toHaveTextContent('글을 삭제했습니다.')
    // 목록 데이터는 비동기로 도착한다. 도착해서 "총 12건"(13번 글이 사라진 상태)이 보일 때까지 기다린다
    expect(await screen.findByText('총 12건')).toBeInTheDocument()
    expect(screen.queryByText('통합 테스트로 쓴 글')).not.toBeInTheDocument()
  })

  it('수정하면 상세에 반영된다', async () => {
    const user = userEvent.setup()
    visit('#/login?redirect=%2Fposts%2F1%2Fedit') // 1번 글은 hong 작성
    render(App)
    await loginAs(user, 'hong')

    const title = await screen.findByLabelText('제목')
    expect(title).toHaveValue('Svelte 5 룬(rune) 정리') // 기존 값으로 시작
    await user.clear(title)
    await user.type(title, '수정된 제목')
    await user.click(screen.getByRole('button', { name: '수정 완료' }))

    expect(await screen.findByRole('heading', { name: '수정된 제목', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: '알림' })).toHaveTextContent('글을 수정했습니다.')
  })

  it('다른 사람의 글에는 수정/삭제 버튼이 없고, 주소로 직접 수정 화면에 가도 막힌다', async () => {
    const user = userEvent.setup()
    visit('#/login')
    render(App)
    await loginAs(user, 'kim')
    await screen.findByText('김철수')

    visit('#/posts/1') // hong의 글
    expect(await screen.findByRole('heading', { name: 'Svelte 5 룬(rune) 정리', level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()

    visit('#/posts/1/edit')
    expect(await screen.findByText('작성자만 수정할 수 있습니다.')).toBeInTheDocument()
    expect(screen.queryByLabelText('제목')).not.toBeInTheDocument()
  })

  it('글쓰기 폼 검증 — 빈 값은 서버까지 가지 않는다', async () => {
    const user = userEvent.setup()
    visit('#/login?redirect=%2Fwrite')
    render(App)
    await loginAs(user)
    await screen.findByRole('heading', { name: '글쓰기' })

    await user.click(screen.getByRole('button', { name: '등록' }))

    expect(screen.getByText('제목은 2자 이상 입력하세요.')).toBeInTheDocument()
    expect(screen.getByText('내용은 5자 이상 입력하세요.')).toBeInTheDocument()
    expect(location.hash).toBe('#/write') // 이동하지 않음
  })
})
