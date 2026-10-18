<script>
  import { useTheme } from './lib/theme.svelte.js'

  const theme = useTheme()
  // context로 받은 값도 반응형이다. toggle()이 호출되면 여기도 자동으로 갱신된다.
  const label = $derived(theme.mode === 'dark' ? '어두운 배경에는 밝은 글씨' : '밝은 배경에는 어두운 글씨')
</script>

<small class="theme-label">{label}</small>
