<script lang="ts">
  // $state: 반응형 상태. 값이 바뀌면 이 값을 쓰는 DOM만 갱신된다.
  // 제네릭 $state<number>(0) 으로 타입을 명시할 수도 있지만, 초기값에서 추론되면 생략해도 된다.
  let count = $state(0)
  let step = $state<number>(1)

  // 일반 let은 값이 바뀌어도 화면이 갱신되지 않는다 (비교용).
  // Svelte가 "$state가 아닌데 바꾸고 있다"고 경고하는데(non_reactive_update), 일부러 보여 주는 예제라 무시 처리.
  // svelte-ignore non_reactive_update
  let plain = 0

  function increase() {
    count += step
    plain += step
    console.log('plain =', plain, '(화면에는 반영되지 않음)')
  }
</script>

<section class="card">
  <h3>1. $state — 기본 카운터</h3>
  <div class="row">
    <button onclick={() => (count -= step)}>- {step}</button>
    <strong>{count}</strong>
    <button onclick={increase}>+ {step}</button>
    <button onclick={() => (count = 0)}>리셋</button>
  </div>
  <p class="muted">step:
    <input type="number" min="1" value={step} oninput={(e) => (step = Number(e.currentTarget.value) || 1)} style="width: 5rem" />
  </p>
  <p class="muted">일반 변수 plain은 내부적으로 {plain}이지만, 화면은 처음 값 그대로다.</p>
</section>
