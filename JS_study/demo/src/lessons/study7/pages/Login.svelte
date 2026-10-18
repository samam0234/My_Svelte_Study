<script>
  import { login } from '../auth.svelte.js'

  let name = $state('')

  function submit(e) {
    e.preventDefault()
    login(name)
    location.hash = '#/admin' // 로그인에 성공하면 원래 가려던 페이지로
  }
</script>

<h3>🔐 로그인</h3>
<p class="muted">관리자 페이지는 로그인해야 열린다. 아무 이름이나 입력하면 된다.</p>
<form class="row" onsubmit={submit}>
  <input bind:value={name} placeholder="이름" aria-label="이름" />
  <button type="submit">로그인</button>
</form>
