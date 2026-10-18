<script>
  import { createPost } from './lib/api.js'

  // oncreated : 새 글이 서버에서 만들어지면 부모에게 알리는 콜백 prop (study3)
  // fail      : true면 일부러 실패하는 주소로 요청 (오류 처리 연습)
  let { oncreated, fail = false } = $props()

  let form = $state({ title: '', body: '' })
  let touched = $state({ title: false, body: false }) // 한 번이라도 입력칸을 벗어났는가
  let submitting = $state(false)
  let serverError = $state('')

  // 검증 규칙은 상태에서 "계산"한다 (저장하지 않는다) → 항상 입력과 일치
  const errors = $derived({
    title: form.title.trim().length < 3 ? '제목은 3자 이상 입력하세요.' : '',
    body: form.body.trim().length < 10 ? '내용은 10자 이상 입력하세요.' : '',
  })
  const valid = $derived(!errors.title && !errors.body)

  async function onsubmit(e) {
    e.preventDefault()
    touched = { title: true, body: true } // 제출을 시도하면 모든 오류를 보여 준다
    if (!valid || submitting) return

    submitting = true
    serverError = ''
    try {
      const created = await createPost({ title: form.title.trim(), body: form.body.trim(), userId: 1 }, { fail })
      oncreated?.(created)
      form = { title: '', body: '' }
      touched = { title: false, body: false }
    } catch (err) {
      serverError = err.message
    } finally {
      submitting = false // 성공/실패와 상관없이 항상 버튼을 되살린다
    }
  }
</script>

<form {onsubmit} novalidate>
  <label>
    제목
    <input
      bind:value={form.title}
      onblur={() => (touched.title = true)}
      aria-invalid={touched.title && !!errors.title}
      aria-describedby="title-error"
    />
  </label>
  <p class="error" id="title-error">{touched.title ? errors.title : ''}</p>

  <label>
    내용
    <textarea
      rows="3"
      bind:value={form.body}
      onblur={() => (touched.body = true)}
      aria-invalid={touched.body && !!errors.body}
      aria-describedby="body-error"
    ></textarea>
  </label>
  <p class="error" id="body-error">{touched.body ? errors.body : ''}</p>

  <div class="row">
    <button type="submit" disabled={submitting}>{submitting ? '저장 중…' : '글 등록'}</button>
    {#if serverError}<span class="error" role="alert">⚠️ {serverError}</span>{/if}
  </div>
</form>

<style>
  form { display: grid; gap: 0.2rem; margin-bottom: 1rem; }
  label { display: grid; gap: 0.2rem; }
  .error { color: crimson; font-size: 0.85rem; margin: 0; min-height: 1.2em; }
  [aria-invalid='true'] { border-color: crimson; }
</style>
