<script lang="ts">
  import { flip } from 'svelte/animate'
  import { scale } from 'svelte/transition'

  interface Item {
    id: number
    label: string
  }

  let items = $state<Item[]>([
    { id: 1, label: 'Svelte' },
    { id: 2, label: 'Vue' },
    { id: 3, label: 'React' },
    { id: 4, label: 'Solid' },
  ])
  let nextId = 5

  function shuffle() {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    items = copy
  }

  function add() {
    items.splice(Math.floor(Math.random() * (items.length + 1)), 0, { id: nextId, label: `새 항목 ${nextId++}` })
  }

  function remove(id: number) {
    items = items.filter((it) => it.id !== id)
  }
</script>

<section class="card">
  <h3>2. animate:flip — 순서가 바뀔 때 부드럽게 이동</h3>
  <div class="row">
    <button onclick={shuffle}>섞기</button>
    <button onclick={add}>랜덤 위치에 추가</button>
    <button onclick={() => (items = [...items].sort((a, b) => a.label.localeCompare(b.label)))}>이름순</button>
  </div>

  <ul>
    <!-- animate: 는 "key가 있는 each"의 바로 아래 요소에만 쓸 수 있다 -->
    {#each items as item (item.id)}
      <li animate:flip={{ duration: 300 }} transition:scale={{ duration: 200 }}>
        {item.label}
        <button onclick={() => remove(item.id)} aria-label="{item.label} 삭제">✕</button>
      </li>
    {/each}
  </ul>
  <p class="muted">flip = First · Last · Invert · Play. 항목의 이전/이후 위치를 계산해서 이동 경로를 애니메이션한다.</p>
</section>

<style>
  ul { list-style: none; padding: 0; margin: 0.8rem 0 0; display: grid; gap: 0.4rem; max-width: 320px; }
  li { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.8rem; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); }
</style>
