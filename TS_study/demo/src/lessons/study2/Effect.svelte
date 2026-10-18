<script lang="ts">
  let seconds = $state(0)
  let running = $state(false)
  let title = $state('Svelte 학습')

  // $effect: 안에서 읽은 상태(running)가 바뀔 때마다 다시 실행된다.
  // return하는 함수는 "정리(cleanup)"로, 다음 실행 직전과 컴포넌트가 사라질 때 호출된다.
  $effect(() => {
    if (!running) return

    const id = setInterval(() => seconds++, 1000)
    return () => clearInterval(id)
  })

  // 브라우저 API(DOM 바깥)와 동기화할 때 쓴다: 상태 → document.title
  $effect(() => {
    document.title = `${title} (${seconds}초)`
  })

  // 화면에 보이는 값을 만들 거면 $effect가 아니라 $derived를 쓴다.
  const minutes = $derived(Math.floor(seconds / 60))

  // 개발 중 값 추적: seconds가 바뀔 때마다 콘솔에 출력 (빌드하면 제거됨)
  $inspect(seconds)
</script>

<section class="card">
  <h3>4. $effect — 부수 효과와 정리</h3>
  <div class="row">
    <strong>{minutes}분 {seconds % 60}초</strong>
    <button onclick={() => (running = !running)}>{running ? '멈춤' : '시작'}</button>
    <button onclick={() => (seconds = 0)}>리셋</button>
  </div>
  <p class="muted">브라우저 탭 제목도 같이 바뀐다. 컴포넌트가 사라지면 cleanup으로 타이머가 정리된다.</p>
  <label class="row">탭 제목: <input value={title} oninput={(e) => (title = e.currentTarget.value)} /></label>
</section>
