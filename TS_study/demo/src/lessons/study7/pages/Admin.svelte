<script lang="ts">
  import { auth, logout } from '../auth.svelte.js'

  function onLogout() {
    logout()
    location.hash = '#/'
  }
</script>

<h3>🛠 관리자 페이지</h3>
<p><strong>{auth.user}</strong>님, 로그인된 사용자만 이 화면을 볼 수 있다.</p>
<button onclick={onLogout}>로그아웃</button>
