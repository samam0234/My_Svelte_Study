<script lang="ts">
  import Counter from './Counter.svelte'
  import DeepState from './DeepState.svelte'
  import Derived from './Derived.svelte'
  import Effect from './Effect.svelte'

  // 컴포넌트를 껐다 켜서 $effect의 cleanup이 동작하는지 확인할 수 있다.
  let showTimer = $state(true)
</script>

<h2>study2 · 반응형 ($state, $derived, $effect)</h2>

<Counter />
<DeepState />
<Derived />

<label class="row" style="margin-bottom: 0.5rem">
  <input type="checkbox" checked={showTimer} onchange={(e) => (showTimer = e.currentTarget.checked)} />
  타이머 컴포넌트 보이기 (끄면 cleanup 실행)
</label>
{#if showTimer}
  <Effect />
{/if}
