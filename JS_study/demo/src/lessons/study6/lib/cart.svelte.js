import { readStorage, writeStorage } from './persisted.svelte.js'

const KEY = 'study6-cart'

// ── 방법 3) 클래스 + 룬 ─────────────────────────────────────────────
// 클래스 필드에 $state / $derived 를 쓸 수 있다.
// 상태 + 파생값 + 그 상태를 바꾸는 규칙(메서드)을 한곳에 모으기 좋다.
export class Cart {
  items = $state(readStorage(KEY, []))

  // 파생값도 클래스 필드로 선언
  count = $derived(this.items.reduce((sum, it) => sum + it.qty, 0))
  total = $derived(this.items.reduce((sum, it) => sum + it.price * it.qty, 0))

  add(product) {
    const found = this.items.find((it) => it.id === product.id)
    if (found) found.qty++
    else this.items.push({ ...product, qty: 1 })
    this.#save()
  }

  remove(id) {
    this.items = this.items.filter((it) => it.id !== id)
    this.#save()
  }

  setQty(id, qty) {
    const found = this.items.find((it) => it.id === id)
    if (!found) return
    if (qty <= 0) this.remove(id)
    else {
      found.qty = qty
      this.#save()
    }
  }

  clear() {
    this.items = []
    this.#save()
  }

  #save() {
    // $state.snapshot: Proxy를 일반 객체로 바꿔서 JSON으로 저장할 수 있게 한다.
    writeStorage(KEY, $state.snapshot(this.items))
  }
}

// 앱 전체가 공유하는 하나의 장바구니
export const cart = new Cart()
