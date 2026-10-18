<script lang="ts">
  import ThemeProvider from './ThemeProvider.svelte'
  import ThemeToggle from './ThemeToggle.svelte'
  import ThemeLabel from './ThemeLabel.svelte'
</script>

<section class="card">
  <h3>3. context — 중간 컴포넌트를 거치지 않고 아래로 전달</h3>

  <ThemeProvider>
    <p>Provider 안쪽 영역 (선택한 테마는 localStorage에 저장됨)</p>
    <div class="nest">
      <!-- 중간에 몇 단계의 컴포넌트/요소가 있어도 props를 한 번도 내리지 않는다 (prop drilling 없음) -->
      <div class="nest">
        <ThemeToggle />
        <ThemeLabel />
      </div>
    </div>
  </ThemeProvider>
</section>

<style>
  .nest { margin-top: 0.5rem; padding-left: 0.8rem; border-left: 2px solid currentColor; display: grid; gap: 0.4rem; justify-items: start; }
</style>
