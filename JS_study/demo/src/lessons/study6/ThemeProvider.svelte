<script>
  import { provideTheme } from './lib/theme.svelte.js'

  let { children } = $props()

  // 이 컴포넌트 아래의 모든 자손이 useTheme()으로 접근할 수 있게 context에 등록한다.
  const theme = provideTheme()
</script>

<!-- data-theme 에 따라 이 영역의 색이 바뀐다. 자손들은 theme이 어디서 왔는지 몰라도 된다. -->
<div class="theme-box" data-theme={theme.mode}>
  {@render children?.()}
</div>

<style>
  .theme-box { border: 1px solid var(--line); border-radius: 10px; padding: 0.8rem 1rem; }
  .theme-box[data-theme='light'] { background: #fff8e1; color: #3e2f00; }
  .theme-box[data-theme='dark'] { background: #263238; color: #eceff1; }
</style>
