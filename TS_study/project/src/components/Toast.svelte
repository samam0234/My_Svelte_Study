<script lang="ts">
  import { fly } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { toasts, dismiss } from '../lib/toast.svelte.js'
</script>

<!-- role="status" + aria-live : 스크린 리더가 새 알림을 자동으로 읽어 준다 -->
<div class="toasts" role="status" aria-live="polite" aria-label="알림">
  {#each toasts as t (t.id)}
    <div class="toast {t.type}" in:fly={{ y: 16, duration: 200 }} out:fly={{ x: 40, duration: 150 }} animate:flip={{ duration: 200 }}>
      <span>{t.message}</span>
      <button onclick={() => dismiss(t.id)} aria-label="알림 닫기">✕</button>
    </div>
  {/each}
</div>

<style>
  .toasts { position: fixed; right: 1rem; bottom: 1rem; display: grid; gap: 0.5rem; z-index: 50; max-width: min(360px, 90vw); }
  .toast { display: flex; gap: 0.8rem; align-items: center; justify-content: space-between; padding: 0.6rem 0.9rem; border-radius: 8px; background: #333; color: #fff; box-shadow: 0 6px 16px rgb(0 0 0 / 0.25); }
  .toast.success { background: seagreen; }
  .toast.error { background: crimson; }
  .toast button { background: transparent; border: none; color: inherit; padding: 0 0.2rem; }
</style>
