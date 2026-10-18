import type { Attachment } from 'svelte/attachments'

type ClickHandler = (event: MouseEvent) => void

interface LongPressOptions {
  duration?: number
  onlongpress?: () => void
}

// ── 액션(action) : use:이름 으로 DOM 요소에 붙이는 재사용 로직 ────────────────
// 형태: function action(node, 매개변수) { ...; return { update(새 매개변수) {}, destroy() {} } }
//  - node     : 이 액션이 붙은 실제 DOM 요소
//  - 매개변수  : use:이름={값} 에서 넘긴 값
//  - update   : 매개변수가 바뀔 때 호출 (선택)
//  - destroy  : 요소가 사라질 때 호출. 여기서 이벤트 리스너 등을 정리한다 (선택이지만 사실상 필수)

/** 요소 바깥을 클릭하면 callback 호출 (드롭다운, 모달 닫기) */
export function clickOutside(node: HTMLElement, callback?: ClickHandler) {
  function onClick(event: MouseEvent) {
    // event.target은 EventTarget 타입이라 contains()가 요구하는 Node로 좁혀 준다
    if (!node.contains(event.target as Node)) callback?.(event)
  }
  // 캡처 단계(true)에서 듣는다: 안쪽에서 stopPropagation()을 해도 놓치지 않기 위해
  document.addEventListener('click', onClick, true)

  return {
    update(next?: ClickHandler) {
      callback = next // 부모가 다른 함수를 넘기면 최신 함수로 교체
    },
    destroy() {
      document.removeEventListener('click', onClick, true)
    },
  }
}

/** 요소가 화면에 붙자마자 포커스 */
export function autofocus(node: HTMLElement, { select = false }: { select?: boolean } = {}) {
  node.focus()
  if (select && node instanceof HTMLInputElement) node.select()
}

/** 일정 시간 이상 누르고 있으면 onlongpress 호출 */
export function longpress(node: HTMLElement, options: LongPressOptions = {}) {
  let { duration = 600, onlongpress } = options
  let timer: ReturnType<typeof setTimeout>

  const start = () => {
    timer = setTimeout(() => onlongpress?.(), duration)
  }
  const cancel = () => clearTimeout(timer)

  node.addEventListener('pointerdown', start)
  node.addEventListener('pointerup', cancel)
  node.addEventListener('pointerleave', cancel)

  return {
    update(next: LongPressOptions) {
      ;({ duration = 600, onlongpress } = next)
    },
    destroy() {
      cancel()
      node.removeEventListener('pointerdown', start)
      node.removeEventListener('pointerup', cancel)
      node.removeEventListener('pointerleave', cancel)
    },
  }
}

// ── 어태치먼트(attachment) : {@attach ...} — Svelte 5.29+의 새 방식 ─────────────
// 액션과 하는 일은 같지만 "요소를 받아 정리 함수를 돌려주는 함수" 하나로 끝난다.
// 안에서 읽은 반응형 상태가 바뀌면 자동으로 정리 후 다시 실행된다 (update 메서드가 필요 없음).
export function clickOutsideAttach(callback?: ClickHandler): Attachment<HTMLElement> {
  return (node) => {
    function onClick(event: MouseEvent) {
      if (!node.contains(event.target as Node)) callback?.(event)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true) // 정리 함수
  }
}
