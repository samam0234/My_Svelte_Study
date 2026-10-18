<script lang="ts">
  // variant 같은 "내 prop"만 꺼내고, 나머지(onclick, disabled, type, aria-* ...)는 rest로 받아 그대로 <button>에 전달한다.
  // 이렇게 만들면 네이티브 button처럼 쓸 수 있는 래퍼 컴포넌트가 된다.
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  // <button>이 받는 모든 속성(onclick, disabled, type ...)을 그대로 물려받는다.
  interface Props extends HTMLButtonAttributes {
    variant?: 'default' | 'primary' | 'danger' | 'ghost'
    children?: Snippet
  }

  let { variant = 'default', children, ...rest }: Props = $props()
</script>

<button class={['btn', variant]} {...rest}>
  {@render children?.()}
</button>

<style>
  .primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  .danger { background: crimson; border-color: crimson; color: #fff; }
  .ghost { background: transparent; }
</style>
