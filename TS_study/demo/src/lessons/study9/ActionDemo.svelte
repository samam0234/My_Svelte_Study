<script lang="ts">
  import { clickOutside, autofocus, longpress, clickOutsideAttach } from './lib/actions.js'

  let menuOpen = $state(false) // use: 액션 버전
  let menu2Open = $state(false) // {@attach} 버전
  let searching = $state(false)
  let longPresses = $state(0)
  let duration = $state(500)

  const items = ['프로필', '설정', '로그아웃']
</script>

<section class="card">
  <h3>3. 액션 use: — DOM 요소에 붙는 재사용 로직</h3>

  <div class="cols">
    <div>
      <p class="muted">clickOutside (use:)</p>
      <!-- 버튼과 메뉴를 같은 wrapper에 두고 wrapper에 액션을 붙인다 → 버튼 클릭이 "바깥 클릭"으로 취급되지 않는다 -->
      <div class="dropdown" use:clickOutside={() => (menuOpen = false)}>
        <button onclick={() => (menuOpen = !menuOpen)} aria-expanded={menuOpen}>메뉴 ▾</button>
        {#if menuOpen}
          <ul class="menu">
            {#each items as it}<li>{it}</li>{/each}
          </ul>
        {/if}
      </div>
    </div>

    <div>
      <p class="muted">같은 기능을 {'{@attach}'} 로</p>
      <div class="dropdown" {@attach clickOutsideAttach(() => (menu2Open = false))}>
        <button onclick={() => (menu2Open = !menu2Open)} aria-expanded={menu2Open}>메뉴 2 ▾</button>
        {#if menu2Open}
          <ul class="menu">
            {#each items as it}<li>{it}</li>{/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>

  <div class="row" style="margin-top: 1rem">
    <button onclick={() => (searching = !searching)}>{searching ? '검색창 닫기' : '검색창 열기'}</button>
    {#if searching}
      <!-- 요소가 만들어지는 순간 자동 포커스 + 전체 선택 -->
      <input use:autofocus={{ select: true }} value="이 글자가 선택됩니다" aria-label="검색" />
    {/if}
  </div>

  <div class="row" style="margin-top: 1rem">
    <!-- 객체를 넘기면 값이 바뀔 때 update()가 호출된다 -->
    <button class="lp" use:longpress={{ duration, onlongpress: () => longPresses++ }}>
      {duration}ms 이상 길게 누르기 ({longPresses}회)
    </button>
    <label>기준 시간
      <input type="range" min="200" max="1500" step="100" value={duration} oninput={(e) => (duration = Number(e.currentTarget.value))} />
    </label>
  </div>
</section>

<style>
  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
  .dropdown { position: relative; display: inline-block; }
  .menu { position: absolute; z-index: 5; top: 110%; left: 0; min-width: 130px; margin: 0; padding: 0.3rem; list-style: none; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 6px 16px rgb(0 0 0 / 0.15); }
  .menu li { padding: 0.3rem 0.5rem; border-radius: 4px; }
  .menu li:hover { background: var(--accent-soft); }
  .cols p { margin: 0 0 0.3rem; }
</style>
