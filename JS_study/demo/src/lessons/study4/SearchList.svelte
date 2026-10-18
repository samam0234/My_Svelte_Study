<script>
  const products = [
    { id: 1, name: '무선 마우스', category: '주변기기', price: 29000 },
    { id: 2, name: '기계식 키보드', category: '주변기기', price: 89000 },
    { id: 3, name: '27인치 모니터', category: '디스플레이', price: 259000 },
    { id: 4, name: '웹캠', category: '주변기기', price: 55000 },
    { id: 5, name: '4K 모니터', category: '디스플레이', price: 489000 },
    { id: 6, name: 'USB 허브', category: '액세서리', price: 19000 },
  ]
  const categories = ['전체', ...new Set(products.map((p) => p.category))]

  let query = $state('')
  let category = $state('전체')
  let sort = $state('name') // 'name' | 'price-asc' | 'price-desc'

  // 검색 + 카테고리 + 정렬을 하나의 $derived로 묶는다.
  const results = $derived.by(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter(
      (p) => (category === '전체' || p.category === category) && p.name.toLowerCase().includes(q),
    )
    // 원본 배열은 건드리지 않도록 복사본을 정렬한다.
    return [...list].sort((a, b) =>
      sort === 'price-asc'
        ? a.price - b.price
        : sort === 'price-desc'
          ? b.price - a.price
          : a.name.localeCompare(b.name),
    )
  })
</script>

<section class="card">
  <h3>4. 검색 · 필터 · 정렬</h3>
  <div class="row">
    <input type="search" placeholder="상품명 검색" bind:value={query} />
    <select bind:value={category}>
      {#each categories as c}
        <option value={c}>{c}</option>
      {/each}
    </select>
    <select bind:value={sort}>
      <option value="name">이름순</option>
      <option value="price-asc">가격 낮은순</option>
      <option value="price-desc">가격 높은순</option>
    </select>
  </div>

  <p class="muted">{results.length} / {products.length}개</p>
  <ul>
    {#each results as p (p.id)}
      <!-- {@const}: 블록 안에서만 쓰는 지역 상수 -->
      {@const formatted = p.price.toLocaleString('ko-KR')}
      <li><strong>{p.name}</strong> <span class="muted">{p.category}</span> · {formatted}원</li>
    {:else}
      <li class="muted">"{query}"에 해당하는 상품이 없습니다.</li>
    {/each}
  </ul>
</section>

<style>
  ul { padding-left: 1.1rem; margin: 0; }
</style>
