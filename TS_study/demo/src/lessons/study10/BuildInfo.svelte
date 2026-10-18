<script lang="ts">
  // import.meta.env : Vite가 "빌드할 때" 값으로 바꿔 넣어 주는 환경 정보.
  //  MODE      : 'development'(npm run dev) | 'production'(npm run build) | --mode 로 지정한 값
  //  DEV/PROD  : 개발 서버인가 / 배포 빌드인가 (boolean)
  //  BASE_URL  : 앱이 서비스되는 기본 경로 (vite.config의 base 옵션)
  //  VITE_*    : .env 파일에 적은 사용자 변수
  const env = import.meta.env

  // [이름, 값] 튜플의 배열. 튜플 타입을 명시하면 구조 분해(`[key, value]`)할 때 각각 string으로 추론된다.
  const rows: [string, string][] = [
    ['MODE', env.MODE],
    ['DEV', String(env.DEV)],
    ['PROD', String(env.PROD)],
    ['BASE_URL', env.BASE_URL],
    ['VITE_APP_TITLE', env.VITE_APP_TITLE ?? '(.env에 없음)'],
  ]
</script>

<section class="card">
  <h3>1. 빌드 환경 정보 — import.meta.env</h3>
  <table>
    <tbody>
      {#each rows as [key, value] (key)}
        <tr>
          <th scope="row"><code>{key}</code></th>
          <td class="value" data-key={key}>{value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="muted">
    <code>npm run dev</code> 에서는 MODE가 development, <code>npm run build</code> 후 <code>npm run preview</code> 에서는 production으로 보인다.
    <code>.env</code> 값은 <strong>빌드 결과물에 그대로 들어가므로 비밀 값은 넣지 않는다.</strong>
  </p>
</section>

<style>
  table { border-collapse: collapse; }
  th { text-align: left; padding: 0.25rem 1rem 0.25rem 0; font-weight: 500; }
  td { padding: 0.25rem 0; }
</style>
