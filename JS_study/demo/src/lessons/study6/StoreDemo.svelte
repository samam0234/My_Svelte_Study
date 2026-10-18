<script>
  import { messages, messageCount, notify, dismiss, clearMessages } from './lib/notify.js'

  let text = $state('')

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    notify(text.trim())
    text = ''
  }

  // 스토어는 컴포넌트 밖(JS)에서는 get()/subscribe()로 읽는다. 템플릿과 <script> 안에서는 $messages 로 쓴다.
  const hasMessages = $derived($messages.length > 0)
</script>

<section class="card">
  <h3>4. svelte/store — 기존 스토어 ($store 자동 구독)</h3>

  <form class="row" onsubmit={submit}>
    <input bind:value={text} placeholder="알림 메시지" />
    <button type="submit">알림 추가</button>
    <button type="button" onclick={clearMessages} disabled={!hasMessages}>모두 지우기</button>
  </form>

  <p class="muted">알림 {$messageCount}개</p>
  <ul>
    {#each $messages as m (m.id)}
      <li>{m.text} <button onclick={() => dismiss(m.id)} aria-label="닫기">✕</button></li>
    {/each}
  </ul>
  <p class="muted">새 코드에서는 위의 룬 방식(.svelte.js)을 권장하지만, 기존 라이브러리와 예제에서는 스토어를 자주 만난다.</p>
</section>

<style>
  ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.2rem; }
</style>
