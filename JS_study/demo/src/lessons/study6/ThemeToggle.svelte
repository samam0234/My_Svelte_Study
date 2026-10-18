<script>
  import { useTheme } from './lib/theme.svelte.js'

  // props를 하나도 받지 않는다. 가장 가까운 ThemeProvider의 값을 context에서 꺼낸다.
  const theme = useTheme()
</script>

<button onclick={theme.toggle}>
  현재: {theme.mode === 'light' ? '☀️ 라이트' : '🌙 다크'} (눌러서 전환)
</button>
