<script>
  let score = $state(75)
  let loggedIn = $state(false)
  let danger = $state(false)

  // 조건에 따라 값을 고르는 일은 {#if} 대신 $derived + 삼항식으로도 충분하다.
  const grade = $derived(score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F')
</script>

<section class="card">
  <h3>1. {'{#if}'} · {'{:else if}'} · {'{:else}'}</h3>

  <div class="row">
    <button onclick={() => (loggedIn = !loggedIn)}>{loggedIn ? '로그아웃' : '로그인'}</button>
    {#if loggedIn}
      <span>환영합니다, 홍길동님 👋</span>
    {:else}
      <span class="muted">로그인이 필요합니다.</span>
    {/if}
  </div>

  <label class="row" style="margin-top: 0.8rem">
    점수 {score}
    <input type="range" min="0" max="100" value={score} oninput={(e) => (score = Number(e.currentTarget.value))} />
  </label>
  {#if score >= 90}
    <p>🏆 최우수 (A)</p>
  {:else if score >= 80}
    <p>👍 우수 (B)</p>
  {:else if score >= 70}
    <p>🙂 보통 (C)</p>
  {:else}
    <p>📚 재도전 (F)</p>
  {/if}
  <p class="muted">같은 판정을 $derived로 만든 값: {grade}</p>
</section>

<section class="card">
  <h3>2. 클래스·스타일 토글</h3>
  <div class="row">
    <!-- class:이름={조건} : 조건이 참일 때만 클래스가 붙는다. 변수 이름이 클래스 이름과 같으면 class:danger 로 축약 -->
    <button class:danger onclick={() => (danger = !danger)}>{danger ? '위험 모드 ON' : '위험 모드 OFF'}</button>
    <!-- style:속성={값} : 개별 CSS 속성을 바인딩 -->
    <span style:color={danger ? 'crimson' : 'inherit'} style:font-weight={danger ? 700 : 400}>상태 메시지</span>
  </div>
</section>

<style>
  .danger { background: crimson; color: white; border-color: crimson; }
</style>
