<script>
  import { testMap, kitMap } from './data.js'
</script>

<section class="card">
  <h3>2. 테스트 지도 — 어떤 테스트가 무엇을 지키는가</h3>
  <p class="muted">터미널에서 <code>npm test</code> 로 모두 실행한다.</p>
  <table>
    <thead><tr><th>진도</th><th>테스트 파일</th><th>검증하는 것</th></tr></thead>
    <tbody>
      {#each testMap as row (row.file)}
        <tr><td>{row.study}</td><td><code>{row.file}</code></td><td>{row.checks}</td></tr>
      {/each}
    </tbody>
  </table>
</section>

<section class="card">
  <h3>3. SvelteKit 대응표 — 다음 단계로 이어지는 길</h3>
  <table>
    <thead><tr><th>지금까지 (SPA)</th><th>SvelteKit</th><th>달라지는 점</th></tr></thead>
    <tbody>
      {#each kitMap as row (row.spa)}
        <tr><td>{row.spa}</td><td>{row.kit}</td><td class="muted">{row.note}</td></tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
  th, td { text-align: left; padding: 0.35rem 0.6rem 0.35rem 0; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--muted); font-weight: 500; }
</style>
