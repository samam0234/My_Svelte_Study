<script>
  // svelte/motion : "값" 자체가 부드럽게 변하게 만든다 (CSS 전환으로 못 하는 숫자 애니메이션)
  import { Tween, Spring, prefersReducedMotion } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  // 사용자가 OS에서 "동작 줄이기"를 켰다면 애니메이션을 끈다 (접근성)
  const progress = new Tween(0, { duration: prefersReducedMotion.current ? 0 : 700, easing: cubicOut })
  const spring = new Spring(0, { stiffness: 0.1, damping: 0.25 })
</script>

<section class="card">
  <h3>5. Tween · Spring — 숫자가 부드럽게 변한다</h3>

  <div class="row">
    {#each [0, 25, 70, 100] as v}
      <button onclick={() => (progress.target = v)}>{v}%</button>
    {/each}
    <button onclick={() => progress.set(Math.round(Math.random() * 100), { duration: 1500 })}>랜덤 (1.5초)</button>
  </div>
  <div class="bar" role="progressbar" aria-valuenow={Math.round(progress.current)} aria-valuemin="0" aria-valuemax="100">
    <div class="fill" style:width="{progress.current}%"></div>
  </div>
  <p>현재 <strong class="num">{Math.round(progress.current)}</strong>% <span class="muted">(목표 {progress.target}%)</span></p>

  <div class="row">
    <button onclick={() => (spring.target = spring.target === 0 ? 240 : 0)}>스프링 토글</button>
    <div class="track"><div class="ball" style:transform="translateX({spring.current}px)"></div></div>
  </div>
</section>

<style>
  .bar { height: 14px; background: var(--line); border-radius: 999px; overflow: hidden; margin: 0.8rem 0 0.4rem; }
  .fill { height: 100%; background: var(--accent); }
  .track { flex: 1; min-width: 280px; padding: 0.5rem 0; }
  .ball { width: 22px; height: 22px; border-radius: 50%; background: var(--accent); }
</style>
