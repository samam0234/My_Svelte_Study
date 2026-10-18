<script lang="ts">
  // svelte/transition : 요소가 DOM에 "들어올 때(in)"와 "나갈 때(out)" 자동으로 재생되는 애니메이션
  import { fade, fly, slide, scale, type TransitionConfig } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'

  let show = $state(true)

  // 커스텀 트랜지션 : { duration, tick(t) } 를 돌려주는 함수.
  // t는 in일 때 0→1, out일 때 1→0 으로 변한다. 텍스트를 t 비율만큼만 보여 주면 타자기 효과가 된다.
  function typewriter(node: HTMLElement, { speed = 30 }: { speed?: number } = {}): TransitionConfig {
    const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE
    if (!valid) throw new Error('typewriter는 텍스트 노드 하나만 가진 요소에만 쓸 수 있습니다.')

    const text = node.textContent ?? ''
    return {
      duration: text.length * speed,
      tick(t) {
        node.textContent = text.slice(0, Math.trunc(text.length * t))
      },
    }
  }
</script>

<section class="card">
  <h3>1. transition · in / out · 커스텀</h3>
  <button onclick={() => (show = !show)}>{show ? '숨기기' : '보이기'}</button>

  <div class="grid">
    {#if show}
      <!-- transition: 들어올 때와 나갈 때 같은 효과 -->
      <div class="box" transition:fade={{ duration: 300 }}>fade</div>

      <!-- in: / out: 으로 다르게 지정 -->
      <div class="box" in:fly={{ y: 24, duration: 400, easing: cubicOut }} out:fade={{ duration: 150 }}>
        in:fly · out:fade
      </div>

      <div class="box" transition:slide={{ duration: 300 }}>slide</div>
      <div class="box" transition:scale={{ start: 0.6, duration: 300 }}>scale</div>

      <p class="box typing" transition:typewriter>타자기처럼 한 글자씩 나타나는 커스텀 트랜지션입니다.</p>
    {/if}
  </div>
  <p class="muted">
    트랜지션은 <code>{'{#if}'}</code>, <code>{'{#each}'}</code> 처럼 요소가 만들어지고 지워지는 블록에서 동작한다.
    나가는 애니메이션이 끝날 때까지 요소는 DOM에 남아 있다.
  </p>
</section>

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.6rem; margin: 0.8rem 0; min-height: 90px; }
  .box { background: var(--accent-soft); border: 1px solid var(--accent); border-radius: 8px; padding: 0.8rem; margin: 0; }
  .typing { grid-column: 1 / -1; }
</style>
