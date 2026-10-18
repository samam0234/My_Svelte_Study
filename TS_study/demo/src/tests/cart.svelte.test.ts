// 파일 이름이 .svelte.test.js 이므로 이 테스트 파일 안에서도 룬($state 등)을 쓸 수 있다.
// 여기서는 룬을 "사용하는" Cart 클래스를 일반 객체처럼 테스트한다.
import { describe, it, expect } from 'vitest'
import { Cart } from '../lessons/study6/lib/cart.svelte.js'

const mouse = { id: 1, name: '마우스', price: 30000 }
const keyboard = { id: 2, name: '키보드', price: 90000 }

describe('Cart', () => {
  it('상품을 담으면 개수와 합계가 계산된다', () => {
    const cart = new Cart()
    cart.add(mouse)
    cart.add(mouse) // 같은 상품은 수량만 증가
    cart.add(keyboard)

    expect(cart.items).toHaveLength(2)
    expect(cart.count).toBe(3)
    expect(cart.total).toBe(30000 * 2 + 90000)
  })

  it('수량 변경, 0 이하가 되면 삭제', () => {
    const cart = new Cart()
    cart.add(mouse)
    cart.setQty(1, 5)
    expect(cart.count).toBe(5)

    cart.setQty(1, 0)
    expect(cart.items).toHaveLength(0)
    expect(cart.total).toBe(0)
  })

  it('remove / clear', () => {
    const cart = new Cart()
    cart.add(mouse)
    cart.add(keyboard)
    cart.remove(1)
    expect(cart.items.map((i) => i.id)).toEqual([2])
    cart.clear()
    expect(cart.count).toBe(0)
  })

  it('localStorage에 저장되고 새 인스턴스가 복원한다', () => {
    const first = new Cart()
    first.add(mouse)
    first.add(mouse)

    const second = new Cart() // 새로고침 후 앱이 다시 시작되는 상황
    expect(second.count).toBe(2)
    expect(second.total).toBe(60000)
  })

  it('저장된 값이 깨져 있어도 빈 장바구니로 시작한다', () => {
    localStorage.setItem('study6-cart', '{깨진 JSON')
    expect(new Cart().items).toEqual([])
  })
})
