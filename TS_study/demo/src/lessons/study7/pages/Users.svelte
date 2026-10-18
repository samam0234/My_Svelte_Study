<script lang="ts">
  import { users } from '../data.js'
</script>

<h3>👥 사용자 목록</h3>
<ul>
  {#each users as u (u.id)}
    <li><a href="#/users/{u.id}">{u.name}</a> <span class="muted">({u.role})</span></li>
  {/each}
</ul>
