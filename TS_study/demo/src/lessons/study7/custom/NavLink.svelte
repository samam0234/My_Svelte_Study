<script lang="ts">
  import type { Snippet } from 'svelte'
  import { router } from './router.svelte.js'

  // exact: 정확히 일치할 때만 활성 (홈 링크처럼 '/'는 모든 경로의 접두사이므로)
  let { to, exact = false, children }: { to: string; exact?: boolean; children?: Snippet } = $props()

  const active = $derived(exact ? router.path === to : router.path === to || router.path.startsWith(to + '/'))
</script>

<a href={'#' + to} class:active aria-current={active ? 'page' : undefined}>
  {@render children?.()}
</a>

<style>
  a { padding: 0.3rem 0.7rem; border-radius: 6px; text-decoration: none; color: inherit; }
  a:hover { background: var(--accent-soft); }
  a.active { background: var(--accent); color: white; }
</style>
