<script lang="ts">
  // tabs  : [{ id, label }]
  // panel : 선택된 탭 id를 받아서 내용을 그리는 snippet
  import type { Snippet } from 'svelte'

  interface Tab {
    id: string
    label: string
  }
  interface Props {
    tabs: Tab[]
    panel: Snippet<[string]> // 선택된 탭 id(string)를 받는 snippet
  }

  let { tabs, panel }: Props = $props()

  // 탭 선택 상태는 이 컴포넌트가 가진다. 아직 고르지 않았다면(null) 첫 번째 탭이 활성.
  // `$state(tabs[0].id)` 처럼 prop을 초기값으로 복사하면 tabs가 바뀌어도 따라가지 못해서(경고 state_referenced_locally),
  // "사용자가 고른 값"과 "화면에 쓰는 값"을 나눠 $derived로 계산한다.
  let selected = $state<string | null>(null)
  const active = $derived(selected ?? tabs[0]?.id ?? '')
</script>

<div class="tabs row" role="tablist">
  {#each tabs as tab (tab.id)}
    <button role="tab" aria-selected={active === tab.id} class:selected={active === tab.id} onclick={() => (selected = tab.id)}>
      {tab.label}
    </button>
  {/each}
</div>
<div class="panel" role="tabpanel">
  {@render panel(active)}
</div>

<style>
  .tabs { gap: 0.2rem; }
  .selected { border-color: var(--accent); background: var(--accent-soft); font-weight: 600; }
  .panel { border: 1px solid var(--line); border-radius: 8px; padding: 0.8rem; margin-top: 0.4rem; }
</style>
