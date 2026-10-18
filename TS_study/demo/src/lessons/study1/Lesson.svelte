<script lang="ts">
  import Greeting from './Greeting.svelte'

  // 일반 JS 변수와 함수. 아직 "반응형"은 아니다 (study2에서 $state로 바꾼다).
  const title = 'Hello, Svelte!'
  // TS: 객체의 모양을 interface로 선언해 두면 오타를 컴파일 전에 잡아 준다.
  interface User {
    name: string
    level: number
  }
  const user: User = { name: '홍길동', level: 1 }
  const src = 'https://svelte.dev/favicon.png'
  const isLoggedIn = true
  const rawHtml = '<em>{@html}은 HTML 문자열을 그대로 넣는다</em>'

  function double(n: number): number {
    return n * 2
  }
</script>

<h2>study1 · 첫 컴포넌트와 템플릿</h2>

<section class="card">
  <h3>1. 텍스트 보간 {'{ }'}</h3>
  <p>{title}</p>
  <p>{user.name}님의 레벨은 {user.level}입니다.</p>
</section>

<section class="card">
  <h3>2. 중괄호 안은 JS 표현식</h3>
  <p>1 + 2 = {1 + 2}</p>
  <p>double(21) = {double(21)}</p>
  <p>로그인 상태: {isLoggedIn ? '로그인됨' : '로그아웃'}</p>
  <p>이름 대문자: {'svelte'.toUpperCase()}</p>
</section>

<section class="card">
  <h3>3. 속성 바인딩</h3>
  <div class="row">
    <!-- 속성 이름과 변수 이름이 같으면 {src} 로 줄여 쓸 수 있다 (src={src}와 동일) -->
    <img {src} alt="Svelte 로고" width="32" height="32" />
    <input value={user.name} aria-label="이름" />
  </div>
</section>

<section class="card">
  <h3>4. 컴포넌트 안에 컴포넌트</h3>
  <Greeting name="Svelte" />
  <Greeting name={user.name} />
  <p class="note">↑ 이 문단의 파란색은 Greeting의 초록색 p에 영향을 주지 않는다 (스타일 스코프).</p>
</section>

<section class="card">
  <h3>5. {'{@html}'} (주의: XSS)</h3>
  <p>{@html rawHtml}</p>
  <p class="muted">사용자 입력을 @html로 넣으면 스크립트가 실행될 수 있으니 신뢰할 수 있는 문자열에만 쓴다.</p>
</section>

<style>
  .note { color: royalblue; }
</style>
