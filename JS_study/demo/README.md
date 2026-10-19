# demo — study1~10 실습 앱 (JS)

Vite + Svelte 5 SPA입니다. 패키지 이름은 `svelte-js-demo`이고, 브라우저 제목은 "Svelte 학습 (JS)"입니다. TypeScript로 같은 화면을 보려면 [`TS_study/demo`](../../TS_study/demo/README.md)를 엽니다.

- 저장소 전체: [README.md](../../README.md)
- 상위 폴더: [README.md](../README.md)
- 진도 설명 study1: [study1.md](../../study1.md)
- 진도 설명 study10: [study10.md](../../study10.md)

## 목적

study1부터 study10까지 작은 화면을 진도별로 보여 줍니다. 게시판처럼 진도끼리 기능이 묶여 있지 않아서, 한 진도의 코드를 고쳐도 다른 진도 화면은 따로 동작합니다.

## 기능

`src/App.svelte`가 `src/lessons/index.js`의 목록으로 왼쪽 목차를 그립니다. 진도를 고르면 `currentId`가 바뀌고 주소가 `?lesson=study3`처럼 남습니다. 새로고침해도 같은 진도가 열립니다. `$derived`가 그 id의 컴포넌트를 골라 `<Lesson />`으로 본문을 바꿉니다. 너비 720px 이하에서는 목차가 본문 위로 올라갑니다.

실행 흐름은 `index.html`의 `<div id="app">` → `main.js`의 `mount(App)` → `App.svelte` → 선택된 진도입니다.

## 실행

이 폴더에서 실행합니다. 저장소 루트에는 `package.json`이 없습니다.

```bash
cd JS_study/demo
npm install
npm run dev        # http://localhost:5173
npm test
npm run build      # dist/
npm run preview
```

| 명령 | 결과 |
|---|---|
| `npm install` | `package-lock.json`에 맞춰 `node_modules/` 생성 |
| `npm run dev` | 개발 서버. 저장하면 브라우저가 갱신 |
| `npm test` | Vitest 한 번 실행. 환경은 jsdom |
| `npm run test:watch` | 파일을 고칠 때마다 관련 테스트 |
| `npm run build` | `dist/`에 정적 파일 생성 |
| `npm run preview` | `dist/`를 로컬에서 열기 |

## 이 폴더의 구성

| 경로 | 설명 |
|---|---|
| [public](./public/README.md) | 가공 없이 제공되는 정적 파일 |
| [src](./src/README.md) | 앱 소스 |
| [.vscode](./.vscode/README.md) | 권장 에디터 확장 |
| `index.html` | 유일한 HTML. `#app`과 `/src/main.js` 연결. `lang="ko"` |
| `package.json` | 의존성과 scripts. 런타임 의존성은 `svelte-spa-router` |
| `package-lock.json` | 설치 버전 고정 |
| `svelte.config.js` | Svelte 컴파일러 설정. 지금은 빈 `{}` |
| `vite.config.js` | `svelte()`, `svelteTesting()`, Vitest의 jsdom과 `src/tests/setup.js` |
| `jsconfig.json` | `jsconfig.json`은 에디터가 JS를 bundler 방식으로 해석하게 합니다. `checkJs`가 켜져 있고, 앱 실행에는 쓰이지 않습니다. |

`node_modules/`는 `npm install`, `dist/`는 `npm run build`로 다시 생깁니다. 두 폴더에는 README를 두지 않습니다.
