<script>
  // $bindable(): 부모가 bind:value 로 연결하면 자식이 값을 바꿨을 때 부모 변수도 같이 바뀐다.
  // (bind:를 허용하겠다고 자식이 명시한 prop만 가능하다)
  let { value = $bindable(0), max = 5 } = $props()
</script>

<div class="row" role="radiogroup" aria-label="별점">
  {#each { length: max } as _, i}
    <button
      class:on={i < value}
      onclick={() => (value = i + 1)}
      role="radio"
      aria-checked={i + 1 === value}
      aria-label="{i + 1}점"
    >
      ★
    </button>
  {/each}
</div>

<style>
  button { border: none; background: none; font-size: 1.5rem; color: var(--line); padding: 0 0.1rem; }
  button.on { color: gold; }
</style>
