<script lang="ts">
  import Card from './Card.svelte'
  import Button from './Button.svelte'
  import Modal from './Modal.svelte'
  import DataList from './DataList.svelte'
  import Tabs from './Tabs.svelte'

  let modalOpen = $state(false)
  let clicks = $state(0)
  interface Todo {
    id: number
    text: string
    done: boolean
  }

  let todos = $state<Todo[]>([
    { id: 1, text: '컴포넌트 합성 이해하기', done: true },
    { id: 2, text: 'snippet 파라미터 써 보기', done: false },
  ])
  const tabs = [
    { id: 'intro', label: '소개' },
    { id: 'usage', label: '사용법' },
    { id: 'tip', label: '팁' },
  ]
</script>

<!-- 같은 파일 안에서만 쓰는 snippet : 반복되는 마크업 조각을 함수처럼 재사용한다. -->
{#snippet badge(text: string, color: string)}
  <span class="badge" style:background={color}>{text}</span>
{/snippet}

<h2>study5 · 컴포넌트 합성 (children · snippet)</h2>

<section class="card">
  <h3>1. children — 태그 사이의 내용</h3>
  <Card title="기본 카드">
    <p>이 문단은 Card의 <code>children</code>으로 전달된다.</p>
  </Card>
  <p class="muted">옛 문법 <code>&lt;slot /&gt;</code> 자리에 <code>{'{@render children?.()}'}</code>를 쓴다.</p>
</section>

<section class="card">
  <h3>2. 이름 있는 snippet — header / footer</h3>
  <Card>
    {#snippet header()}
      <h3>제목 자리에 {@render badge('NEW', 'seagreen')} 배지</h3>
    {/snippet}

    본문은 snippet이 아닌 나머지 내용이 자동으로 children이 된다.

    {#snippet footer()}
      <span>마지막 수정: 오늘 · {@render badge('초안', 'gray')}</span>
    {/snippet}
  </Card>
</section>

<section class="card">
  <h3>3. 래퍼 컴포넌트 — Button (...rest)</h3>
  <div class="row">
    <Button onclick={() => clicks++}>기본 {clicks}</Button>
    <Button variant="primary" onclick={() => clicks++}>primary</Button>
    <Button variant="danger" onclick={() => (clicks = 0)}>danger (리셋)</Button>
    <Button variant="ghost" disabled>disabled</Button>
  </div>
  <p class="muted">Button은 onclick, disabled를 몰라도 되고, rest로 받아 그대로 &lt;button&gt;에 넘긴다.</p>
</section>

<section class="card">
  <h3>4. 모달 — bind:open + actions snippet</h3>
  <Button variant="primary" onclick={() => (modalOpen = true)}>모달 열기</Button>
  <Modal bind:open={modalOpen} title="정말 삭제할까요?">
    <p>ESC 키, 배경 클릭, 버튼으로 닫을 수 있다.</p>
    {#snippet actions()}
      <button onclick={() => (modalOpen = false)}>취소</button>
      <Button variant="danger" onclick={() => { clicks = 0; modalOpen = false }}>삭제</Button>
    {/snippet}
  </Modal>
</section>

<section class="card">
  <h3>5. 렌더 프롭 — DataList (snippet에 파라미터)</h3>
  <DataList items={todos}>
    {#snippet item(todo: Todo, i: number)}
      <span>{i + 1}. {todo.text}</span>
      {@render badge(todo.done ? '완료' : '진행', todo.done ? 'seagreen' : 'darkorange')}
    {/snippet}
  </DataList>

  <p style="margin-top: 0.8rem"><strong>빈 목록</strong></p>
  <DataList items={[]}>
    {#snippet item(x: unknown)}{x}{/snippet}
    {#snippet empty()}<p class="muted">😅 아직 할 일이 없어요.</p>{/snippet}
  </DataList>
</section>

<section class="card">
  <h3>6. 탭 — panel snippet이 선택된 id를 받는다</h3>
  <Tabs {tabs}>
    {#snippet panel(id: string)}
      {#if id === 'intro'}
        <p>컴포넌트 합성은 "빈칸이 있는 컴포넌트"를 만드는 일이다.</p>
      {:else if id === 'usage'}
        <p>빈칸 = <code>children</code> 또는 이름 있는 snippet.</p>
      {:else}
        <p>데이터를 넘길 때는 props, 모양을 넘길 때는 snippet.</p>
      {/if}
    {/snippet}
  </Tabs>
</section>

<style>
  .badge { color: white; font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 999px; margin-left: 0.3rem; }
</style>
