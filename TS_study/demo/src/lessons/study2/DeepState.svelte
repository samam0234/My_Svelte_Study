<script lang="ts">
  // $state에 객체/배열을 넣으면 "깊은 반응형"이 된다.
  // 내부를 직접 바꿔도(push, 속성 대입) 화면이 갱신된다. 새 객체로 교체할 필요가 없다.
  interface User {
    name: string
    age: number
  }
  let user = $state<User>({ name: '홍길동', age: 20 })
  // 빈 배열처럼 추론이 어려울 때는 제네릭으로 타입을 알려 준다.
  let fruits = $state<string[]>(['사과', '바나나'])
  let newFruit = $state('')

  function addFruit() {
    const v = newFruit.trim()
    if (!v) return
    fruits.push(v) // React와 달리 push해도 된다
    newFruit = ''
  }

  function logSnapshot() {
    // $state 값은 Proxy라서 console.log하면 읽기 불편하다. 일반 객체로 복사해 보려면:
    console.log($state.snapshot(user), $state.snapshot(fruits))
  }
</script>

<section class="card">
  <h3>2. 객체·배열 상태 (깊은 반응형)</h3>
  <div class="row">
    <button onclick={() => user.age++}>나이 +1</button>
    <button onclick={() => (user.name = user.name === '홍길동' ? '김철수' : '홍길동')}>이름 바꾸기</button>
    <span>{user.name} ({user.age}세)</span>
  </div>

  <ul>
    {#each fruits as fruit, i}
      <li>
        {fruit}
        <button onclick={() => fruits.splice(i, 1)}>삭제</button>
      </li>
    {/each}
  </ul>
  <div class="row">
    <input
      placeholder="과일 이름"
      value={newFruit}
      oninput={(e) => (newFruit = e.currentTarget.value)}
      onkeydown={(e) => e.key === 'Enter' && addFruit()}
    />
    <button onclick={addFruit}>추가</button>
    <button onclick={() => fruits.sort()}>정렬</button>
    <button onclick={logSnapshot}>콘솔에 snapshot 출력</button>
  </div>
  <p class="muted">입력창을 직접 연결하는 더 쉬운 방법(bind:value)은 study3에서 배운다.</p>
</section>
