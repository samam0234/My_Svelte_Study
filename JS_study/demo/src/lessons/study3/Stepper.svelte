<script>
  // 자식 → 부모 통신은 "함수를 prop으로 내려 받아 호출"하는 방식이다.
  // 이름은 관례로 on 으로 시작한다 (onchange, onselect ...). Svelte 5의 "이벤트"가 곧 콜백 prop.
  let { value, min = 0, max = 10, onchange } = $props()

  function update(next) {
    if (next < min || next > max) return
    // props는 읽기 전용처럼 다룬다. 값을 직접 바꾸지 않고 부모에게 "이렇게 바꿔 줘"라고 알린다.
    onchange?.(next)
  }
</script>

<div class="row">
  <button onclick={() => update(value - 1)} disabled={value <= min} aria-label="감소">-</button>
  <strong>{value}</strong>
  <button onclick={() => update(value + 1)} disabled={value >= max} aria-label="증가">+</button>
</div>
