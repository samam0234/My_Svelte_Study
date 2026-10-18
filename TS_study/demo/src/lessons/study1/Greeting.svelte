<script lang="ts">
  // props는 study3에서 자세히 다룬다. 지금은 "부모가 name을 내려 준다"만 확인.
  let { name }: { name: string } = $props()
</script>

<p>안녕하세요, <strong>{name}</strong>님! (Greeting 컴포넌트)</p>

<style>
  /* 이 p 스타일은 Greeting 안에서만 적용된다. */
  p { color: seagreen; }
</style>
