# study10 — 테스트 · 빌드 · SvelteKit 맛보기

새 조작을 추가하기보다, 이미 만든 실습이 테스트와 빌드 정보로 어떻게 확인되는지, SvelteKit에서는 어떤 파일로 바뀌는지를 보여 줍니다.

- 저장소 전체: [README.md](../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study10 문서: [study10.md](../../../../../study10.md)

TypeScript 같은 폴더: [`TS_study/demo/src/lessons/study10`](../../../../../TS_study/demo/src/lessons/study10/README.md)

## 목적

`npm run dev`와 `npm run build` 뒤 `preview`에서 `import.meta.env`가 달라지는 것을 화면에 표시합니다. `.env`의 `VITE_` 값은 빌드 결과에 들어가므로 비밀을 넣지 않습니다. SvelteKit 프로젝트 자체는 이 저장소에 없고, 대응표만 있습니다.

테스트 코드는 이 폴더가 아니라 [../../tests/README.md](../../tests/README.md)에 있습니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | `BuildInfo`와 `MapTables`를 이어서 표시 |
| `BuildInfo.svelte` | `MODE`, `DEV`, `PROD`, `BASE_URL`, `VITE_APP_TITLE` 표 |
| `MapTables.svelte` | `data`의 두 배열을 표로 렌더 |
| `data.js` | `testMap`: 어떤 테스트가 어떤 진도를 지키는지. `kitMap`: SPA 개념과 SvelteKit `+page`, `load`, form actions, hooks, `+server`, adapter 대응 |

## 테스트

[tests/BuildInfo.test.js](../../tests/README.md)가 환경 표의 값을 확인하고, 스모크 테스트가 모든 진도 `Lesson`의 마운트를 확인합니다.
