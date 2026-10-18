<script>
  let items = $state([
    { name: '노트북', price: 1200000, qty: 1 },
    { name: '마우스', price: 30000, qty: 2 },
    { name: '키보드', price: 80000, qty: 1 },
  ])
  let minPrice = $state(0)

  // $derived: 다른 상태로부터 계산되는 값. 의존하는 상태가 바뀔 때만 다시 계산된다.
  // 계산 결과이므로 직접 대입하지 않고, 의존성(items, minPrice)은 컴파일러가 자동으로 찾아 준다.
  const total = $derived(items.reduce((sum, it) => sum + it.price * it.qty, 0))
  const count = $derived(items.length)

  // 여러 줄의 로직이 필요하면 $derived.by
  const expensive = $derived.by(() => {
    const list = items.filter((it) => it.price >= minPrice)
    return list.map((it) => it.name).join(', ') || '(없음)'
  })

  const won = (n) => n.toLocaleString('ko-KR') + '원'
</script>

<section class="card">
  <h3>3. $derived — 파생 값</h3>
  <table>
    <tbody>
      {#each items as item}
        <tr>
          <td>{item.name}</td>
          <td>{won(item.price)}</td>
          <td>
            <button onclick={() => item.qty--} disabled={item.qty <= 0}>-</button>
            {item.qty}
            <button onclick={() => item.qty++}>+</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p>상품 {count}종, 합계 <strong>{won(total)}</strong></p>

  <label class="row">
    최소 가격 {won(minPrice)}
    <input type="range" min="0" max="1500000" step="10000" value={minPrice}
      oninput={(e) => (minPrice = Number(e.currentTarget.value))} />
  </label>
  <p>조건에 맞는 상품: {expensive}</p>
</section>

<style>
  table { border-collapse: collapse; margin-bottom: 0.5rem; }
  td { padding: 0.25rem 0.8rem 0.25rem 0; }
</style>
