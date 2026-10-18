<script>
  import { users } from '../data.js'

  // 라우터가 주소에서 뽑아낸 파라미터를 params prop으로 넘겨 준다.
  // 예) 경로 패턴 '/users/:id' + 주소 '#/users/2' → params = { id: '2' }
  let { params = {} } = $props()

  // params가 바뀌면(다른 사용자로 이동) 자동으로 다시 찾는다.
  const user = $derived(users.find((u) => u.id === params.id))
</script>

{#if user}
  <h3>👤 {user.name}</h3>
  <p class="muted">id: {params.id} · {user.role}</p>
  <p>{user.bio}</p>
{:else}
  <h3>😕 사용자를 찾을 수 없습니다</h3>
  <p>id <code>{params.id}</code> 에 해당하는 사용자가 없다.</p>
{/if}
<p><a href="#/users">← 목록으로</a></p>
