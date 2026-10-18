<script>
  import { splitByQuery, formatDate } from '../lib/text.js'

  // posts : 보여 줄 게시글 배열,  q : 강조 표시할 검색어
  let { posts, q = '' } = $props()
</script>

{#if posts.length === 0}
  <p class="empty">{q ? `"${q}"에 해당하는 글이 없습니다.` : '아직 작성된 글이 없습니다.'}</p>
{:else}
  <ul>
    {#each posts as post (post.id)}
      <li>
        <a class="title" href="#/posts/{post.id}">
          <!-- {@html} 대신 조각으로 나눠서 일치하는 부분만 <mark>로 감싼다 (XSS 방지) -->
          {#each splitByQuery(post.title, q) as part}{#if part.match}<mark>{part.text}</mark>{:else}{part.text}{/if}{/each}
        </a>
        <span class="meta">
          {post.authorName} · {formatDate(post.createdAt)} · 조회 {post.views}
        </span>
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--line); }
  li { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: 0.7rem 0.2rem; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
  .title { font-weight: 600; text-decoration: none; color: var(--text); }
  .title:hover { color: var(--accent); }
  .meta { color: var(--muted); font-size: 0.85rem; }
  .empty { text-align: center; color: var(--muted); padding: 2rem 0; }
</style>
