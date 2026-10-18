<script lang="ts">
  import { getPost } from './lib/api.js'

  let id = $state<number>(1)

  // $derived가 Promise를 돌려주면: id가 바뀔 때마다 새 요청이 만들어지고,
  // {#await} 블록은 "가장 최근 Promise"의 결과만 보여 준다 (늦게 도착한 옛 응답은 무시).
  const promise = $derived(getPost(id))
</script>

<section class="card">
  <h3>1. {'{#await}'} — Promise를 템플릿에서 바로</h3>

  <div class="row">
    <button onclick={() => id--} disabled={id <= 1}>이전</button>
    <label>글 번호
      <input type="number" min="1" value={id} oninput={(e) => (id = Number(e.currentTarget.value) || 1)} style="width: 6rem" />
    </label>
    <button onclick={() => id++}>다음</button>
    <span class="muted">(100을 넘기면 404 → catch 확인)</span>
  </div>

  {#await promise}
    <p class="status loading">불러오는 중…</p>
  {:then post}
    <article class="result">
      <h4>#{post.id} {post.title}</h4>
      <p class="muted">{post.body}</p>
    </article>
  {:catch error}
    <p class="status error">⚠️ {error.message}</p>
  {/await}
</section>

<style>
  h4 { margin: 0.8rem 0 0.2rem; }
  .status { margin: 0.8rem 0 0; }
  .error { color: crimson; }
</style>
