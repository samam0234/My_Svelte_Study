<script>
  // 폼 입력 전부를 하나의 $state 객체로 모은다.
  let form = $state({
    name: '',
    age: 20,
    agree: false,
    gender: 'none',
    skills: ['svelte'],
    city: 'seoul',
    memo: '',
  })
  let submitted = $state(null)

  function onsubmit(e) {
    e.preventDefault() // Svelte 5에는 |preventDefault 수식어가 없다. 직접 호출한다.
    submitted = $state.snapshot(form)
  }
</script>

<form {onsubmit}>
  <div class="grid">
    <label>이름 <input bind:value={form.name} placeholder="홍길동" /></label>
    <!-- type=number / range 는 bind:value 가 자동으로 숫자로 변환해 준다 -->
    <label>나이 <input type="number" min="0" bind:value={form.age} /></label>

    <label>도시
      <select bind:value={form.city}>
        <option value="seoul">서울</option>
        <option value="busan">부산</option>
        <option value="jeju">제주</option>
      </select>
    </label>

    <fieldset>
      <legend>성별 (bind:group)</legend>
      <label><input type="radio" value="none" bind:group={form.gender} /> 선택 안 함</label>
      <label><input type="radio" value="m" bind:group={form.gender} /> 남</label>
      <label><input type="radio" value="f" bind:group={form.gender} /> 여</label>
    </fieldset>

    <fieldset>
      <legend>관심 기술 (체크박스 그룹)</legend>
      <label><input type="checkbox" value="svelte" bind:group={form.skills} /> Svelte</label>
      <label><input type="checkbox" value="vue" bind:group={form.skills} /> Vue</label>
      <label><input type="checkbox" value="react" bind:group={form.skills} /> React</label>
    </fieldset>
  </div>

  <label class="block">메모 <textarea rows="2" bind:value={form.memo}></textarea></label>
  <label><input type="checkbox" bind:checked={form.agree} /> 약관에 동의합니다</label>

  <div class="row">
    <button type="submit" disabled={!form.agree}>제출</button>
    <span class="muted">동의해야 제출 버튼이 켜진다 (disabled는 상태로 계산)</span>
  </div>
</form>

<pre>현재 상태: {JSON.stringify(form, null, 1)}</pre>
{#if submitted}
  <p>제출됨 → <code>{JSON.stringify(submitted)}</code></p>
{/if}

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.6rem; margin-bottom: 0.6rem; }
  label { display: flex; gap: 0.4rem; align-items: center; }
  .block { flex-direction: column; align-items: stretch; margin-bottom: 0.4rem; }
  fieldset { border: 1px solid var(--line); border-radius: 8px; display: grid; gap: 0.2rem; }
  pre { background: var(--accent-soft); padding: 0.6rem; border-radius: 8px; overflow: auto; }
</style>
