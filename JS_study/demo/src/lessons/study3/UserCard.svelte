<script>
  // $props(): 부모가 내려 준 값을 구조 분해로 받는다.
  //  - 기본값:   age = 20
  //  - 나머지:   ...rest  (name/age/role 이외에 넘어온 모든 속성)
  let { name, age = 20, role = 'guest', ...rest } = $props()
</script>

<!-- {...rest}: 넘어온 나머지 속성(title, data-* 등)을 그대로 요소에 전달 -->
<article {...rest}>
  <strong>{name}</strong>
  <span class="muted">{age}세 · {role}</span>
</article>

<style>
  article {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.8rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    margin-bottom: 0.4rem;
  }
</style>
