<script>
  // open 은 $bindable : 자식(닫기 버튼)이 바꿔도 부모의 상태가 같이 바뀐다.
  let { open = $bindable(false), title, children, actions } = $props()

  function onkeydown(e) {
    if (e.key === 'Escape') open = false
  }
</script>

<!-- 전역 키 이벤트는 <svelte:window>로 등록한다. 컴포넌트가 사라지면 자동 해제된다. -->
<svelte:window {onkeydown} />

{#if open}
  <div class="backdrop" role="presentation" onclick={() => (open = false)}>
    <!-- 모달 안쪽 클릭은 배경 클릭으로 처리되지 않게 전파를 막는다 -->
    <div class="modal" role="dialog" aria-modal="true" aria-label={title} tabindex="-1"
      onclick={(e) => e.stopPropagation()} onkeydown={onkeydown}>
      <h3>{title}</h3>
      {@render children?.()}
      <div class="actions row">
        {#if actions}
          {@render actions()}
        {:else}
          <button onclick={() => (open = false)}>닫기</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop { position: fixed; inset: 0; background: rgb(0 0 0 / 0.45); display: grid; place-items: center; z-index: 10; }
  .modal { background: var(--panel); padding: 1.2rem 1.4rem; border-radius: 12px; min-width: 280px; max-width: 90vw; }
  .actions { justify-content: flex-end; margin-top: 1rem; }
</style>
