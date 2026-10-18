<script>
  import UserCard from './UserCard.svelte'
  import Stepper from './Stepper.svelte'
  import Rating from './Rating.svelte'
  import BindForm from './BindForm.svelte'

  const userData = { name: '김철수', age: 25, role: 'admin' }

  let qty = $state(1)
  let score = $state(3)
</script>

<h2>study3 · props · 이벤트(콜백) · bind</h2>

<section class="card">
  <h3>1. props — 부모 → 자식</h3>
  <UserCard name="홍길동" />
  <UserCard name="이영희" age={31} role="member" title="마우스를 올리면 보이는 rest 속성" />
  <UserCard {...userData} />
  <p class="muted">기본값(age=20, role=guest), 나머지 속성(...rest), 객체 펼치기({'{...userData}'})</p>
</section>

<section class="card">
  <h3>2. 콜백 props — 자식 → 부모</h3>
  <Stepper value={qty} min={1} max={5} onchange={(next) => (qty = next)} />
  <p>부모가 가진 수량: <strong>{qty}</strong> (1 ~ 5 범위 제한은 자식이 담당)</p>
</section>

<section class="card">
  <h3>3. $bindable + bind: — 양방향</h3>
  <Rating bind:value={score} />
  <p>별점 {score}점 <button onclick={() => (score = 0)}>초기화</button></p>
  <p class="muted">부모가 score를 바꿔도(초기화 버튼) 자식 화면이 따라 바뀐다.</p>
</section>

<section class="card">
  <h3>4. 폼 바인딩 (bind:value / bind:checked / bind:group)</h3>
  <BindForm />
</section>
