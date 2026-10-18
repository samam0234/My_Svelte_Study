<script lang="ts">
  // $state는 Map/Set/Date/URL 같은 내장 객체 안쪽까지는 추적하지 못한다.
  // svelte/reactivity 의 SvelteSet, SvelteMap, SvelteDate, SvelteURL 은 반응형으로 만들어 둔 버전이다.
  import { SvelteSet } from 'svelte/reactivity'

  const tags = ['Svelte', 'Vue', 'React', 'Angular', 'Solid']
  const selected = new SvelteSet<string>(['Svelte'])

  function toggle(tag: string) {
    if (selected.has(tag)) selected.delete(tag)
    else selected.add(tag)
  }
</script>

<section class="card">
  <h3>5. SvelteSet — 반응형 Set</h3>
  <div class="row">
    {#each tags as tag (tag)}
      <button class:on={selected.has(tag)} onclick={() => toggle(tag)}>{tag}</button>
    {/each}
  </div>
  <p>선택 {selected.size}개: <span class="picked">{[...selected].join(', ') || '(없음)'}</span></p>
</section>

<style>
  .on { background: var(--accent-soft); border-color: var(--accent); font-weight: 600; }
</style>
