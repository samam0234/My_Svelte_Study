<script lang="ts">
  // 글쓰기/수정이 함께 쓰는 폼 (study8의 검증·전송 패턴)
  //  initial    : 입력칸의 처음 값 (수정할 때는 기존 글)
  //  onsubmit   : 검증을 통과한 값으로 호출되는 async 함수. 던진 오류는 이 폼이 화면에 보여 준다.
  //  cancelHref : "취소" 링크가 가는 주소
  import type { PostInput } from '../lib/api.js'

  interface Props {
    initial?: PostInput
    submitLabel?: string
    onsubmit?: (values: PostInput) => Promise<void> | void
    cancelHref?: string
  }

  let { initial = { title: '', content: '' }, submitLabel = '저장', onsubmit, cancelHref = '#/' }: Props = $props()

  // 폼은 만들어질 때의 initial 값으로 "한 번만" 시작하면 된다. (이후엔 사용자가 입력하는 값이 원본)
  // svelte-ignore state_referenced_locally
  let values = $state({ title: initial.title, content: initial.content })
  let touched = $state({ title: false, content: false })
  let submitting = $state(false)
  let serverError = $state('')

  // 검증은 입력값에서 "계산"한다
  const errors = $derived({
    title: values.title.trim().length < 2 ? '제목은 2자 이상 입력하세요.' : values.title.length > 60 ? '제목은 60자 이하로 입력하세요.' : '',
    content: values.content.trim().length < 5 ? '내용은 5자 이상 입력하세요.' : '',
  })
  const valid = $derived(!errors.title && !errors.content)

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    touched = { title: true, content: true }
    if (!valid || submitting) return

    submitting = true
    serverError = ''
    try {
      await onsubmit?.({ title: values.title.trim(), content: values.content.trim() })
    } catch (err) {
      serverError = err instanceof Error ? err.message : '저장하지 못했습니다.'
    } finally {
      submitting = false
    }
  }
</script>

<form onsubmit={submit} novalidate>
  <label>
    제목
    <input
      bind:value={values.title}
      onblur={() => (touched.title = true)}
      aria-invalid={touched.title && !!errors.title}
      aria-describedby="title-error"
      maxlength="80"
    />
  </label>
  <p class="error msg" id="title-error">{touched.title ? errors.title : ''}</p>

  <label>
    내용
    <textarea
      rows="8"
      bind:value={values.content}
      onblur={() => (touched.content = true)}
      aria-invalid={touched.content && !!errors.content}
      aria-describedby="content-error"
    ></textarea>
  </label>
  <p class="error msg" id="content-error">{touched.content ? errors.content : ''}</p>

  <div class="row">
    <button type="submit" class="primary" disabled={submitting}>{submitting ? '저장 중…' : submitLabel}</button>
    <a href={cancelHref}>취소</a>
    {#if serverError}<span class="error" role="alert">⚠️ {serverError}</span>{/if}
  </div>
</form>

<style>
  form { display: grid; gap: 0.2rem; }
  label { display: grid; gap: 0.3rem; font-weight: 600; }
  input, textarea { font-weight: 400; }
  .msg { margin: 0 0 0.6rem; min-height: 1.2em; font-size: 0.85rem; }
  [aria-invalid='true'] { border-color: crimson; }
</style>
