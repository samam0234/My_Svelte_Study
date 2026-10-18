<script lang="ts">
  // 입력창에 직접 글을 쓴 뒤 "순서 뒤집기"를 눌러 보자.
  // key가 있는 목록은 입력한 글이 항목을 따라 움직이고, key가 없는 목록은 제자리에 남는다.
  interface Item {
    id: number
    name: string
  }

  let items = $state<Item[]>([
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 3, name: 'C' },
  ])

  function reverse() {
    items = [...items].reverse()
  }
</script>

<section class="card">
  <h3>5. key의 효과 — 순서가 바뀔 때 DOM 재사용</h3>
  <button onclick={reverse}>순서 뒤집기</button>
  <div class="cols">
    <div>
      <p><strong>key 있음</strong> <code>(item.id)</code></p>
      {#each items as item (item.id)}
        <div class="item keyed"><input placeholder={item.name} /></div>
      {/each}
    </div>
    <div>
      <p><strong>key 없음</strong></p>
      {#each items as item}
        <div class="item unkeyed"><input placeholder={item.name} /></div>
      {/each}
    </div>
  </div>
  <p class="muted">
    key 없는 쪽은 placeholder(A,B,C)만 바뀌고 입력한 글은 제자리에 남는다.
    입력 중인 폼, 포커스, 애니메이션이 있는 목록은 항상 key를 쓴다.
  </p>
</section>

<style>
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.6rem; }
  .item { margin-bottom: 0.3rem; }
</style>
