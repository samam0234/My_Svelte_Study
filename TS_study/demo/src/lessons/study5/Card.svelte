<script lang="ts">
  // children   : 태그 사이에 쓴 내용 (옛 <slot />의 대체)
  // header/footer : 이름 있는 snippet. 부모가 안 주면 undefined 이므로 ?. 로 호출한다.
  import type { Snippet } from 'svelte'

  // Snippet 타입: "마크업 조각"을 prop으로 받는다. 파라미터가 없으면 Snippet, 있으면 Snippet<[타입, ...]>
  interface Props {
    title?: string
    children?: Snippet
    header?: Snippet
    footer?: Snippet
  }

  let { title, children, header, footer }: Props = $props()
</script>

<article>
  <header>
    {#if header}
      {@render header()}
    {:else}
      <h3>{title}</h3>
    {/if}
  </header>

  <div class="body">
    {@render children?.()}
  </div>

  {#if footer}
    <footer>{@render footer()}</footer>
  {/if}
</article>

<style>
  article { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; margin-bottom: 0.8rem; background: var(--bg); }
  header { padding: 0.5rem 0.9rem; border-bottom: 1px solid var(--line); background: var(--accent-soft); }
  header :global(h3) { margin: 0; font-size: 1rem; color: inherit; }
  .body { padding: 0.8rem 0.9rem; }
  footer { padding: 0.5rem 0.9rem; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.9rem; }
</style>
