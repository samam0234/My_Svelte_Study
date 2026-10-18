<script>
  import { cart } from './lib/cart.svelte.js'

  const products = [
    { id: 1, name: '무선 마우스', price: 29000 },
    { id: 2, name: '기계식 키보드', price: 89000 },
    { id: 3, name: 'USB 허브', price: 19000 },
  ]
  const won = (n) => n.toLocaleString('ko-KR') + '원'
</script>

<section class="card">
  <h3>2. 클래스 기반 스토어 — 장바구니 (새로고침해도 유지)</h3>

  <!-- 상품 목록과 장바구니 요약은 서로 전혀 모르는 컴포넌트라고 생각해도 된다: 둘 다 cart만 import한다. -->
  <div class="cols">
    <div>
      <p class="muted">상품 목록</p>
      <ul>
        {#each products as p (p.id)}
          <li>
            {p.name} · {won(p.price)}
            <button onclick={() => cart.add(p)}>담기</button>
          </li>
        {/each}
      </ul>
    </div>

    <div>
      <p class="muted">장바구니 ({cart.count}개)</p>
      <ul class="cart">
        {#each cart.items as it (it.id)}
          <li>
            {it.name}
            <button onclick={() => cart.setQty(it.id, it.qty - 1)} aria-label="감소">-</button>
            {it.qty}
            <button onclick={() => cart.setQty(it.id, it.qty + 1)} aria-label="증가">+</button>
            <button onclick={() => cart.remove(it.id)} aria-label="삭제">✕</button>
          </li>
        {:else}
          <li class="muted">비어 있습니다.</li>
        {/each}
      </ul>
      <p>합계 <strong class="total">{won(cart.total)}</strong></p>
      <button onclick={() => cart.clear()} disabled={cart.count === 0}>비우기</button>
    </div>
  </div>
</section>

<style>
  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
  ul { list-style: none; padding: 0; margin: 0 0 0.5rem; display: grid; gap: 0.3rem; }
</style>
