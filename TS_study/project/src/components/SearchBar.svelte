<script lang="ts">
  // value    : 주소(URL)에 들어 있는 현재 검색어 — 검색 상태의 "진짜 원본"
  // onsearch : 검색을 실행하면 부모에게 알리는 콜백 (부모가 주소를 바꾼다)
  interface Props {
    value?: string
    onsearch?: (text: string) => void
  }

  let { value = '', onsearch }: Props = $props()

  // draft : 사용자가 입력창에 "치고 있는 중"인 값. 제출하기 전까지는 주소에 반영하지 않는다.
  let draft = $state('')

  // 주소가 바뀌면(뒤로가기, 초기화 등) 입력창도 그 값으로 맞춘다.
  $effect(() => {
    draft = value
  })

  function submit(e: SubmitEvent) {
    e.preventDefault()
    onsearch?.(draft.trim())
  }
</script>

<form role="search" class="row" onsubmit={submit}>
  <input type="search" bind:value={draft} placeholder="제목·내용·작성자 검색" aria-label="검색어" />
  <button type="submit" class="primary">검색</button>
  {#if value}
    <button type="button" onclick={() => onsearch?.('')}>초기화</button>
  {/if}
</form>

<style>
  form { margin-bottom: 1rem; }
  input { flex: 1; min-width: 12rem; }
</style>
