<script lang="ts" generics="T">
  // "렌더 프롭" 패턴 : 목록을 반복하는 일은 DataList가, 각 항목을 어떻게 그릴지는 부모가 snippet으로 정한다.
  //  items : 배열
  //  item  : 파라미터를 받는 snippet  → {@render item(값, 인덱스)}
  //  empty : 비었을 때 보여 줄 snippet (선택)
  import type { Snippet } from 'svelte'

  // generics="T": 어떤 타입의 배열이든 받는 제네릭 컴포넌트. item snippet은 (T, number)를 받는다.
  interface Props {
    items: T[]
    item: Snippet<[T, number]>
    empty?: Snippet
  }

  let { items, item, empty }: Props = $props()
</script>

{#if items.length > 0}
  <ul>
    {#each items as it, i}
      <li>{@render item(it, i)}</li>
    {/each}
  </ul>
{:else if empty}
  {@render empty()}
{:else}
  <p class="muted">데이터가 없습니다.</p>
{/if}

<style>
  ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.2rem; }
</style>
