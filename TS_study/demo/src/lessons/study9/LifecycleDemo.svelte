<script lang="ts">
  import { tick } from 'svelte'
  import LifeChild from './LifeChild.svelte'
  import { logs, clearLogs } from './lib/lifelog.svelte.js'

  let showChild = $state(false)

  // bind:this : DOM 요소를 변수에 담는다. 요소가 만들어지기 전에는 undefined.
  let box = $state<HTMLDivElement>()
  let messages = $state<string[]>(['안녕하세요!'])
  let text = $state('')
  let width = $state<number>(0) // bind:clientWidth : 요소의 너비를 읽기 전용으로 바인딩

  async function send(e: SubmitEvent) {
    e.preventDefault()
    if (!text.trim()) return
    messages.push(text.trim())
    text = ''

    // 상태를 바꿔도 DOM은 "다음 갱신 때" 바뀐다. tick()을 기다리면 DOM 갱신이 끝난 뒤를 보장한다.
    await tick()
    if (box) box.scrollTop = box.scrollHeight // 새 메시지가 그려진 뒤에 맨 아래로 스크롤
  }
</script>

<section class="card">
  <h3>4. 생명주기 · bind:this · tick</h3>

  <div class="row">
    <button onclick={() => (showChild = !showChild)}>{showChild ? '자식 제거' : '자식 만들기'}</button>
    <button onclick={clearLogs}>로그 지우기</button>
  </div>
  <div class="stage">
    {#if showChild}<LifeChild name="자식 컴포넌트" />{/if}
  </div>
  <ol class="log" aria-label="생명주기 로그">
    {#each logs as line, i (i)}<li>{line}</li>{:else}<li class="muted">버튼을 눌러 순서를 확인해 보세요.</li>{/each}
  </ol>
  <p class="muted">자식의 count 버튼을 누르면 ⑤③ (이전 effect 정리 → 다시 실행)이 반복되는 것도 볼 수 있다.</p>

  <hr />

  <div class="chat" bind:this={box} bind:clientWidth={width} aria-label="채팅">
    {#each messages as m, i (i)}<p>{m}</p>{/each}
  </div>
  <form class="row" onsubmit={send}>
    <input bind:value={text} placeholder="메시지 입력" aria-label="메시지" />
    <button type="submit">보내기</button>
    <span class="muted">채팅창 너비 {width}px</span>
  </form>
</section>

<style>
  .stage { min-height: 3rem; margin: 0.6rem 0; }
  .log { margin: 0; padding-left: 1.4rem; font-size: 0.9rem; max-height: 9rem; overflow: auto; }
  hr { border: none; border-top: 1px solid var(--line); margin: 1rem 0; }
  .chat { height: 6rem; overflow: auto; border: 1px solid var(--line); border-radius: 8px; padding: 0.4rem 0.8rem; margin-bottom: 0.5rem; background: var(--bg); }
  .chat p { margin: 0.2rem 0; }
</style>
