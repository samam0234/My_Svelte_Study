# Svelte 학습 저장소

Svelte 5를 **이론 문서 → 클릭해서 보는 실습 → 그 내용을 전부 모은 미니 게시판** 순서로 익히는 저장소입니다. 같은 화면과 같은 기능을 JavaScript와 TypeScript로 각각 한 벌씩 두었습니다. Vue나 React로 UI를 만들어 본 뒤, 같은 문제를 Svelte에서는 어떻게 쓰는지 나란히 비교하는 것이 이 저장소의 학습 방식입니다.

이 문서는 저장소 전체를 한 자리에서 설명합니다. 문법 자체의 설명은 루트의 `study0.md`~`studyFinal.md`에 있고, 각 소스 폴더의 `README.md`는 그 폴더의 파일과 역할을 설명합니다. 입구는 [JS_study](./JS_study/README.md)와 [TS_study](./TS_study/README.md)입니다.

`node_modules/`와 `dist/`는 `npm install`, `npm run build`로 다시 생기므로 README를 두지 않습니다. `.agent`, `.claude`, `.codex`, `.grok`은 편집기·에이전트 설정이라 학습 폴더 설명에 넣지 않습니다.

---

## 1. 루트 — 이 저장소가 하는 일

루트에는 실행되는 앱이 없습니다. 루트는 **커리큘럼**이고, 실행은 그 아래 네 개의 Vite 앱이 담당합니다.

```
Svelte/                          ← 여기. 학습 문서와 두 언어 트랙의 입구
├─ study0.md ~ study10.md        ← 진도별 이론·실습 설명
├─ studyFinal.md                 ← 응용 게시판 설계 설명
├─ JS_study/                     ← JavaScript로 쓴 실습 앱 + 게시판
└─ TS_study/                     ← 같은 내용을 TypeScript로 쓴 실습 앱 + 게시판
```

### 1-1. 무엇을 배우려고 모았는가

Svelte는 컴파일러 기반 UI 프레임워크입니다. `.svelte` 파일은 브라우저가 그대로 실행하지 않습니다. Vite 플러그인(`@sveltejs/vite-plugin-svelte`)이 빌드 시점에 그 파일을 읽고, “이 상태가 바뀌면 이 DOM을 이렇게 고친다”는 JavaScript로 바꿉니다. React의 가상 DOM 비교나 Vue의 런타임 추적과 달리, **어떤 상태가 어떤 DOM에 연결되는지를 컴파일러가 미리 알고** 필요한 갱신 코드만 남깁니다. Svelte 5부터 그 결과물은 작은 시그널 런타임과 함께 동작합니다.

이 저장소가 반복해서 쓰는 Svelte 5의 핵심은 **룬(rune)** 입니다. `$`로 시작하는 컴파일러 지시어이고, import 없이 씁니다.

| 룬 | 하는 일 | 이 저장소에서 처음 만나는 곳 |
|---|---|---|
| `$state` | 바뀌면 화면이 따라가는 상태 | study2, 이후 모든 실습 |
| `$derived` | 다른 상태로 계산되는 값 | study2, 게시판의 검색·페이지는 주소에서 파생 |
| `$effect` | 상태가 바뀔 때 실행되는 부수 효과 | study2, 목록 다시 불러오기, 요청 취소 |
| `$props` | 부모가 내려 준 값 | study3 |
| `$bindable` | 부모가 `bind:`로 양방향 연결할 수 있는 prop | study3, study5 모달 |

`.svelte` 파일 하나는 컴포넌트 하나입니다. `<script>`(로직), 마크업(HTML과 Svelte 블록), `<style>`(그 컴포넌트 안으로 자동 제한되는 스타일)이 한 파일에 있습니다. 세 영역 모두 있어도 되고 없어도 됩니다.

컴포넌트끼리 값을 주고받는 방법도 이 저장소 전체에서 같습니다.

- 부모 → 자식: props
- 자식 → 부모: 콜백 prop (함수를 내려 준다)
- 양방향: `$bindable()`과 `bind:`
- 멀리 떨어진 컴포넌트: `setContext` / `getContext`, 또는 `.svelte.js` / `.svelte.ts` 모듈의 공유 상태
- 태그 사이에 내용을 끼워 넣기: `children`과 `{#snippet}` (Svelte 5. 옛 `<slot>`의 자리)

### 1-2. 왜 앱이 네 개인가

학습 단위는 두 단계이고, 언어는 두 가지입니다. 그래서 실행 가능한 Vite 프로젝트가 네 개입니다.

| 폴더 | 패키지 이름 | 대응하는 문서 | 화면에 나오는 것 |
|---|---|---|---|
| `JS_study/demo` | `svelte-js-demo` | study1 ~ study10 | 왼쪽 목차에서 진도를 고르는 실습 앱 |
| `JS_study/project` | `svelte-js-board` | studyFinal | 목록·상세·검색·로그인이 있는 미니 게시판 |
| `TS_study/demo` | `svelte-ts-demo` | study1 ~ study10 | `JS_study/demo`와 같은 실습. `<script lang="ts">` |
| `TS_study/project` | `svelte-ts-board` | studyFinal | `JS_study/project`와 같은 게시판. 타입만 추가 |

JS 트리와 TS 트리는 **화면, 라우트, 폴더 이름, 기능이 같습니다.** 파일 확장자와 타입 선언만 다릅니다. JS는 `main.js`, `.svelte.js`이고 TS는 `main.ts`, `.svelte.ts`, `<script lang="ts">`입니다. 서로 데이터를 주고받지 않으므로 한쪽만 따라가도 커리큘럼이 닫힙니다. TS 쪽은 `npm run check`로 `svelte-check`와 `tsc` 검사를 추가로 돌립니다.

각 앱은 `npm create vite@latest`의 `svelte` / `svelte-ts` 템플릿으로 시작한 **클라이언트 전용 SPA**입니다. 라우팅이 필요해지는 study7부터 `svelte-spa-router`를 쓰고, 게시판도 그 라이브러리의 해시 라우팅(`#/posts/3`)을 씁니다. SvelteKit(파일 기반 라우팅, SSR, 서버 API)은 이 저장소 안에 프로젝트로 들어 있지 않습니다. study10이 SPA에서 쓰던 개념이 SvelteKit에서 어떤 파일로 바뀌는지만 대응표로 보여 주고, studyFinal이 그 이전을 다음 과제로 남겨 둡니다.

### 1-3. 문서와 코드가 맞물리는 방식

문서는 루트에 한 벌입니다. 코드는 언어별로 두 벌입니다. 한 진도를 볼 때는 문서 하나와 실습 폴더 두 개(JS, TS)를 같이 엽니다.

| 문서 | 다루는 내용 | 실습 코드 |
|---|---|---|
| [study0.md](./study0.md) | Svelte가 무엇인지, 룬, 템플릿, Vue/React와의 차이, 개발 환경 | 실행 코드 없음. 이후 모든 진도의 밑그림 |
| [study1.md](./study1.md) | Vite 프로젝트 생성, npm 명령, 첫 컴포넌트와 `{ }` 템플릿 | `*/demo/src/lessons/study1/` |
| [study2.md](./study2.md) | `$state`, 깊은 반응형, `$derived`, `$effect` | `*/demo/src/lessons/study2/` |
| [study3.md](./study3.md) | `$props`, 콜백, `$bindable`, 폼 `bind:` | `*/demo/src/lessons/study3/` |
| [study4.md](./study4.md) | `{#if}`, `{#each}`와 key, 검색·필터·정렬 | `*/demo/src/lessons/study4/` |
| [study5.md](./study5.md) | `children`, snippet, 버튼·카드·모달·탭·리스트 합성 | `*/demo/src/lessons/study5/` |
| [study6.md](./study6.md) | `.svelte.js` 모듈, 클래스 스토어, context, `svelte/store` | `*/demo/src/lessons/study6/` |
| [study7.md](./study7.md) | 해시 라우터를 직접 만들기, `svelte-spa-router`, 라우트 가드 | `*/demo/src/lessons/study7/` |
| [study8.md](./study8.md) | `{#await}`, `fetch` 계층, 요청 취소, 폼 검증, 낙관적 업데이트 | `*/demo/src/lessons/study8/` |
| [study9.md](./study9.md) | `transition`, `animate:flip`, `use:` 액션, 생명주기, `svelte/motion` | `*/demo/src/lessons/study9/` |
| [study10.md](./study10.md) | Vitest, 빌드와 `import.meta.env`, SvelteKit으로 넘어가는 대응표 | `*/demo/src/lessons/study10/`와 `*/demo/src/tests/` |
| [studyFinal.md](./studyFinal.md) | 위 내용을 한 게시판에 조립한 설계와 테스트 | `*/project/` |

`*`는 `JS_study`와 `TS_study` 양쪽을 뜻합니다. 예를 들어 study4의 할 일 목록은 `JS_study/demo/src/lessons/study4/TodoList.svelte`와 `TS_study/demo/src/lessons/study4/TodoList.svelte`에 같은 기능으로 있습니다.

각 문서는 같은 뼈대를 가집니다. 이번 진도의 목표, 개념 설명, 실습 파일이 그 개념을 어떻게 보여 주는지, Vue/React면 어떤 API에 대응하는지, TypeScript 버전에서 타입이 어디에 더해졌는지, 자주 하는 실수, 확인 문제, 직접 해보기입니다.

### 1-4. 학습이 쌓이는 순서

순서를 바꾸면 앞 진도의 룬과 컴포넌트 규칙을 모른 채 뒤 진도를 보게 됩니다. 권장 순서는 문서 번호와 같습니다.

```
study0   이론        컴파일러, .svelte 파일, 룬, 통신 방향
study1   시작        Vite 앱을 띄우고 { } 로 값을 화면에 넣는다
study2   반응형      상태가 바뀌면 화면이 바뀐다
study3   통신        부모와 자식이 props · 콜백 · bind 로 값을 주고받는다
study4   렌더링      조건과 리스트, key, 검색·필터·정렬
study5   합성        빈칸이 있는 컴포넌트 (children, snippet)
study6   공유 상태   props 드릴 없이 여러 컴포넌트가 같은 값을 본다
study7   라우팅      주소가 화면을 고른다. 가드와 경쟁 상태
study8   API         로딩·성공·실패·취소, 폼 검증, 낙관적 업데이트
study9   움직임      등장/퇴장, 리스트 재배치, DOM 액션, 생명주기
study10  품질        테스트가 회귀를 잡고, 빌드 결과와 환경 변수를 본다
Final    종합        목록 · 상세 · 검색 · 로그인 게시판
다음     SvelteKit   파일 라우팅, load, form actions, SSR (이 저장소 밖)
```

demo 앱은 이 순서를 왼쪽 목차로 보여 줍니다. 진도를 고르면 주소가 `?lesson=study3`처럼 바뀌고, 새로고침해도 같은 진도가 열립니다. project 앱은 목차가 없습니다. study1~10에서 만든 부품을 하나의 게시판 흐름으로 이어 붙인 결과물입니다.

### 1-5. 기술 스택과 실행 환경

| 도구 | 역할 |
|---|---|
| Node.js 20 이상 (문서는 Node 24 기준으로 작성) | JavaScript 실행, npm |
| Vite 8 (`vite` ^8) | 개발 서버, HMR, 프로덕션 번들 |
| Svelte 5 (`svelte` ^5.57) | `.svelte` 컴파일러와 룬 런타임 |
| `@sveltejs/vite-plugin-svelte` 7 | Vite가 `.svelte`를 컴파일하게 연결 |
| `svelte-spa-router` 5 | study7 라이브러리 라우터와 게시판의 해시 라우팅 |
| Vitest 5 + jsdom | 단위·컴포넌트·통합 테스트. 브라우저 API를 흉내 낸 환경 |
| Testing Library (`@testing-library/svelte`, `user-event`, `jest-dom`) | 화면을 사용자 입장에서 찾고 클릭 |
| TypeScript 6, `svelte-check`, `@tsconfig/svelte` | TS 트랙 전용. `npm run check` |

네 앱의 `package.json` `scripts`는 같습니다. TS 앱만 `check`가 추가됩니다.

| 명령 | 하는 일 |
|---|---|
| `npm install` | `package-lock.json`에 잠긴 의존성을 `node_modules/`에 설치 |
| `npm run dev` | 개발 서버. 기본 주소는 `http://localhost:5173`. 저장하면 브라우저가 즉시 갱신 |
| `npm run build` | 배포용 정적 파일을 `dist/`에 생성 |
| `npm run preview` | `dist/`를 로컬에서 열어 배포와 가까운 상태로 확인 |
| `npm test` | Vitest를 한 번 실행하고 종료 |
| `npm run test:watch` | 파일을 고칠 때마다 관련 테스트를 다시 실행 |
| `npm run check` | TS 앱만. `svelte-check`로 컴포넌트 타입을 보고, `tsc`로 `vite.config.ts`를 검사 |

앱 네 개의 개발 서버는 모두 5173 포트를 기본으로 씁니다. 두 개를 동시에 띄우면 나중 것이 다른 포트로 밀리거나 포트 충돌이 납니다. 한 번에 하나 안에서 `npm run dev`를 실행합니다.

게시판(`*/project`) 데모 계정은 **`hong` / `1234`**, **`kim` / `1234`** 입니다. 비밀번호가 프런트 코드에 있는 것은 학습용입니다. studyFinal이 말하는 대로, 실제 서비스에서는 서버가 비밀번호를 검증하고 세션을 발급합니다.

### 1-6. 루트 파일 각각의 목적

루트 파일은 전부 학습 문서입니다. 앱 설정 파일(`package.json`, `vite.config`)은 루트에 없습니다. 설정은 앱 네 개가 각자 가집니다.

| 파일 | 목적 | 기능 (이 파일을 읽고 얻을 수 있는 것) |
|---|---|---|
| `README.md` | 저장소 지도 | 루트의 학습 목표, 문서↔코드 대응, 각 폴더의 목적과 기능, 실행 방법 |
| `study0.md` | 코드를 치기 전의 이론 | Svelte와 React/Vue의 차이, `.svelte` 세 영역, 룬 표, 템플릿 문법 색인, 컴포넌트 통신, 진도 지도. 확인 문제 5개 |
| `study1.md` | 환경을 만들고 첫 화면을 띄움 | `npm create vite`의 `svelte` / `svelte-ts` 템플릿, `npm run dev/build/preview/check`의 의미, `index.html → main → App` 실행 흐름, `{ }` 보간·속성 바인딩·`{@html}`의 XSS 주의 |
| `study2.md` | 반응형을 손으로 확인 | 일반 `let`은 화면을 갱신하지 않는 이유, 객체·배열의 깊은 반응형, `$derived`와 `$effect`를 나누는 기준, 컴포넌트 함수는 한 번만 실행된다는 점 |
| `study3.md` | 컴포넌트를 쪼개고 연결 | `$props()` 기본값, 이벤트를 콜백 prop으로 통일, `$bindable`, `bind:value` / `bind:checked` 같은 폼 바인딩 |
| `study4.md` | 조건과 목록 | `{#if}`, `{#each item, i (key)}`, key를 빼면 입력 중이던 DOM이 엉키는 이유, 파생 배열로 검색·필터·정렬 |
| `study5.md` | 재사용 가능한 껍데기 | `children`, 이름 있는 snippet, 같은 파일 안의 snippet, `...rest` 버튼, `$bindable` 모달, snippet 파라미터(렌더 프롭), 탭은 상태를 자식이 갖고 내용은 부모가 채움 |
| `study6.md` | 컴포넌트 밖의 반응형 | `.svelte.js`에서 룬을 쓰는 이유, 모듈 싱글톤과 팩토리, 클래스 필드 `$state`, context로 테마 전달, `writable`/`derived` 스토어, `SvelteSet` 같은 `svelte/reactivity`, 무엇을 고를지의 기준 |
| `study7.md` | SPA 라우팅 두 가지 | 직접 만든 해시 라우터(`matchPath`, 가드, 로그아웃 경쟁 상태)와 `svelte-spa-router`(`wrap`, `use:link`, `use:active`). 페이지 컴포넌트는 두 라우터가 공유 |
| `study8.md` | 비동기 화면 | 로딩·성공·빈 결과·실패, API 함수와 화면의 분리, `{#await}`, `createResource`와 `AbortSignal`, `$effect`로 다시 불러오기, 검증은 `$derived`로 계산, 낙관적 업데이트와 롤백 |
| `study9.md` | 움직임과 DOM 수명 | `transition:` / `in:` / `out:`, `animate:flip`, `use:` 액션의 setup·update·destroy, `onMount`와 `$effect`, `Tween`/`Spring` |
| `study10.md` | 품질과 다음 단계 | 테스트 설치, 단위·컴포넌트·스모크 테스트, 변이를 넣어 테스트가 진짜 실패하는지 확인, `npm run build`와 `import.meta.env`, SvelteKit `load` / form actions / 어댑터 대응표 |
| `studyFinal.md` | 종합 설계 문서 | 게시판 화면표, 진도 개념이 어느 파일에 쓰였는지, 주소가 검색 상태의 원본인 이유, 가짜 백엔드, API가 권한의 최종 검사인 이유, `safeRedirect`, `{@html}` 없이 검색어 강조, 테스트 50개의 목록과 변이 확인, Vue/React 대응표, TS 타입 메모, 한계와 도전 과제 |

### 1-7. 게시판이 실습을 어디에 다시 썼는가

`studyFinal.md`의 대응을 저장소 관점에서 다시 적으면 아래와 같습니다. 자세한 설계 이유는 그 문서를 봅니다.

| 배운 진도 | 게시판에서의 기능 |
|---|---|
| study1 | 글 내용은 `{ }`로만 출력. 검색어 강조도 `{@html}` 없이 `<mark>` |
| study2 | 폼 상태, 검증 오류, 주소에서 파생한 `q`·`page`, 주소가 바뀌면 목록을 다시 불러오는 `$effect` |
| study3 | `PostForm`의 `onsubmit`, `SearchBar`의 `onsearch`, `Pagination`의 `hrefFor`, 입력 `bind:value` |
| study4 | 목록 `{#each}`, 빈 결과 `{:else}`, 페이지 번호, 검색과 페이지네이션 |
| study5 | `Header`, `Toast`, `PostForm` 분리. `<svelte:head>`로 문서 제목. 이 규모에서는 snippet 대신 props |
| study6 | `AuthStore` 클래스, `toasts` 모듈 상태. 새로고침 후에도 로그인 유지 |
| study7 | `svelte-spa-router` + `wrap({ conditions })`. 가드에 막히면 로그인으로, 성공하면 원래 주소로 |
| study8 | `lib/api`가 Promise·지연·`ApiError`를 흉내. `createResource`가 취소·로딩·오류를 담당. 검증 후 전송 |
| study9 | 토스트 `in:fly` `out:fly` `animate:flip` |
| study10 | `lib` 단위 테스트, 폼 컴포넌트 테스트, 앱 통합 테스트. 문서는 50개 |

게시판의 데이터는 브라우저 `localStorage`에 있습니다. 키가 비어 있으면 시드 글 12개를 넣고, `resetDb()`로 초기 데이터로 되돌립니다. 화면은 `lib/api`의 함수만 부릅니다. 나중에 서버가 생기면 그 함수 본문을 `fetch`로 바꾸면 화면 코드는 거의 그대로 둡니다.

### 1-8. 생성물과 손대지 않는 곳

네 앱 모두 아래 두 폴더는 소스 코드가 아닙니다.

| 경로 | 생기는 명령 | 내용 |
|---|---|---|
| `*/node_modules/` | `npm install` | npm이 받은 의존성. Svelte, Vite, Vitest, jsdom, Testing Library와 그 하위 패키지 |
| `*/dist/` | `npm run build` | 브라우저에 올릴 `index.html`, 해시가 붙은 JS/CSS, `favicon.svg` |

둘 다 지운 뒤 위 명령으로 다시 만들 수 있습니다. 학습과 수정은 `src/`와 설정 파일에서 합니다.

---

## 2. `JS_study/` 와 `TS_study/`

두 폴더의 **목적**은 같습니다. Svelte 5 실습(demo)과 종합 게시판(project)을 언어별로 나눠, 문법을 비교할 때 파일이 섞이지 않게 하는 것입니다.

**기능상 차이**는 타입 검사뿐입니다.

| | `JS_study` | `TS_study` |
|---|---|---|
| 실습 앱 | `demo/` | `demo/` |
| 게시판 | `project/` | `project/` |
| 소스 확장자 | `.js`, `.svelte.js` | `.ts`, `.svelte.ts` |
| 컴포넌트 스크립트 | `<script>` | `<script lang="ts">` |
| 설정 | `vite.config.js`, `jsconfig.json` | `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` |
| 환경 변수 타입 | 없음 | demo의 `src/env.d.ts`가 `VITE_APP_TITLE`을 선언 |
| 추가 명령 | 없음 | `npm run check` |
| 에디터 힌트 | `jsconfig.json`의 `checkJs` | `tsconfig.app.json`이 `src/**/*.ts`, `src/**/*.svelte`를 포함 |

TS 게시판은 도메인 타입을 `lib/api.ts`에 모읍니다. `User`, `Post`, `PostInput`, `PostPage`, `ApiError`, 그리고 로그인 여부를 좁히는 `requireUser`(`asserts user is User`)가 거기 있습니다. `createResource<PostPage, { q: string; page: number }>`처럼 응답 타입과 `load` 인자 타입을 호출하는 쪽이 지정합니다. JS 게시판의 `api.js`는 같은 필드를 쓰되 인터페이스 선언은 없습니다.

아래 3절과 4절의 폴더 설명은 **JS와 TS에 공통**입니다. 경로의 `JS_study`를 `TS_study`로 바꾸고 확장자만 `.ts`로 읽으면 됩니다. 예외는 각 절 끝의 “TS에만 있는 파일”에 적습니다.

---

## 3. `demo/` — study1~10 실습 앱

**목적.** 진도마다 작은 화면을 하나씩 보여주고, 왼쪽 목차에서 그 화면으로 이동하게 합니다. 게시판처럼 기능이 서로 의존하지 않습니다. 한 진도를 망가뜨려도 다른 진도 화면은 따로 탑니다.

**기능.** `App.svelte`가 `lessons/index`의 목록을 읽어 사이드바를 그립니다. 버튼을 누르면 `currentId`가 바뀌고 `history.replaceState`로 `?lesson=studyN`을 남깁니다. `$derived`가 그 id의 컴포넌트를 고르면 `<Lesson />`으로 본문을 바꿉니다. 720px 이하에서는 사이드바가 본문 위로 쌓입니다.

JS 앱 제목은 `Svelte 학습 (JS)`, TS 앱 제목은 `Svelte 학습 (TS)`입니다.

### 3-1. 앱 루트 파일

| 파일 | 목적 | 기능 |
|---|---|---|
| `index.html` | 유일한 HTML 문서 | `<div id="app">`과 `<script type="module" src="/src/main.js">`(TS는 `main.ts`). 한국어 `lang="ko"` |
| `package.json` | 의존성과 명령 | 위 1-5절의 scripts. 런타임 의존성은 `svelte-spa-router`뿐이고 나머지는 devDependencies |
| `package-lock.json` | 설치 재현 | 의존성 트리를 고정. `npm install`이 이 파일을 따른다 |
| `svelte.config.js` | Svelte 컴파일러 설정 자리 | 지금은 빈 설정 `{}`. 전처리나 컴파일러 옵션을 넣을 때 이 파일을 고친다 |
| `vite.config.js` (TS는 `.ts`) | Vite와 Vitest 설정 | `svelte()` 플러그인, `svelteTesting()`(테스트용 브라우저 빌드와 render cleanup), `environment: 'jsdom'`, `setupFiles`, `src/**/*.{test,spec}.js` 포함 |
| `jsconfig.json` | JS 앱의 에디터 설정 | bundler 모듈 해석, `checkJs`, `src`의 js/svelte 포함. 앱 실행에는 쓰이지 않는다 |
| `public/favicon.svg` | 정적 파일 | Vite가 가공하지 않고 `/favicon.svg`로 그대로 제공. `index.html`의 아이콘 |
| `src/main.js` | 시작점 | `app.css`를 읽고 `mount(App, { target: #app })`. Svelte 5의 기동 방식 |
| `src/app.css` | 전역 스타일 | 실습 화면이 공유하는 글자, 여백, 카드, 색 변수 |
| `src/App.svelte` | 최상위 컴포넌트 | 진도 목차와 선택된 레슨 렌더. 주소 쿼리 `lesson`과 동기화 |

TS demo에만 있는 설정:

| 파일 | 목적 | 기능 |
|---|---|---|
| `tsconfig.json` | 솔루션 스타일의 빈 루트 | `tsconfig.app.json`과 `tsconfig.node.json`을 references로만 연결. 직접 `include`하지 않음 |
| `tsconfig.app.json` | 앱 소스 타입 검사 | `@tsconfig/svelte`를 확장. `src/**/*.ts`, `src/**/*.js`, `src/**/*.svelte`. `noEmit` |
| `tsconfig.node.json` | Node 쪽에서 도는 설정 파일 | `vite.config.ts`만 포함. `nodenext`, 미사용 변수 금지 |
| `src/env.d.ts` | Vite 환경 변수 타입 | `ImportMetaEnv`에 `VITE_APP_TITLE`을 선언해 `import.meta.env` 오타를 잡음 |

### 3-2. `src/lessons/`

**목적.** 진도 하나의 폴더. `index.js`(TS는 `index.ts`)가 각 폴더의 `Lesson.svelte`를 모아 `App`에 넘깁니다. 새 진도를 넣을 때는 폴더를 만들고 이 목록에 `{ id, title, component }` 한 줄을 추가합니다.

현재 목록은 study1부터 study10까지 열 개입니다. study0과 studyFinal은 이 목차에 없습니다. study0은 이론만 있고, studyFinal은 `project/` 앱입니다.

#### `study1/` — 첫 컴포넌트와 템플릿

**목적.** 반응형 없이, 값과 표현식을 마크업에 넣는 방법을 보여 줍니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | `{title}`, 객체 필드, 삼항 연산, 함수 호출, `img {src}`, `class:` 조건부 클래스, `{@html}`이 HTML 문자열을 그대로 넣는다는 경고 |
| `Greeting.svelte` | 부모가 준 `name` prop을 받아 인사말을 그리는 자식 컴포넌트 |

#### `study2/` — `$state` · `$derived` · `$effect`

**목적.** 일반 변수와 룬의 차이를 네 개의 작은 예제로 나눕니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 네 예제를 한 화면에 배치 |
| `Counter.svelte` | 버튼을 누를 때마다 `$state` 숫자가 화면의 글자와 함께 증가 |
| `DeepState.svelte` | 객체 필드와 배열 항목을 직접 고쳐도 화면이 따라가는 깊은 반응형 |
| `Derived.svelte` | 입력에서 `$derived`로 두 배, 합계 등을 계산. 파생 값을 직접 대입하지 않음 |
| `Effect.svelte` | 초시계 `$effect`와 cleanup(타이머 해제), `document.title` 동기화, 개발용 `$inspect` |

#### `study3/` — props · 콜백 · `bind:`

**목적.** 컴포넌트를 나누고 부모와 자식이 값을 주고받게 합니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 예제를 한 화면에 배치 |
| `UserCard.svelte` | 이름, 레벨 같은 props를 받아 카드로 표시. 기본값 |
| `Stepper.svelte` | 현재 값 prop과 증가/감소 콜백. 최솟값·최댓값에서는 버튼을 비활성화 |
| `Rating.svelte` | `$bindable` 점수를 부모가 `bind:`로 연결 |
| `BindForm.svelte` | `bind:value` 등으로 입력 칸과 상태를 양방향으로 연결하는 폼 |

#### `study4/` — 조건 렌더링 · 리스트

**목적.** 조건과 배열로 화면을 만들고, key와 파생 목록까지 갑니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 예제를 한 화면에 배치 |
| `Conditional.svelte` | `{#if}` / `{:else if}` / `{:else}`로 상태별 문구와 버튼을 바꿈 |
| `KeyDemo.svelte` | `{#each}`에 key가 있을 때와 없을 때 입력 DOM이 어떻게 따라붙는지 비교 |
| `TodoList.svelte` | 할 일 추가·완료 토글·삭제·필터. 빈 목록 문구 |
| `SearchList.svelte` | 검색어, 필터, 정렬을 `$derived` 배열로 계산해 목록을 그림 |

#### `study5/` — 컴포넌트 합성

**목적.** 내용은 부모가 채우고 껍데기·동작은 자식이 맡는 컴포넌트를 만듭니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 카드, 버튼, 모달, 탭, 데이터 리스트를 조합해 보여 줌 |
| `Card.svelte` | 기본 `children`과 header/footer snippet으로 카드의 세 칸을 채움 |
| `Button.svelte` | 공통 버튼 스타일. 나머지 속성·이벤트는 `...rest`로 전달 |
| `Modal.svelte` | `$bindable`로 열림 상태를 공유. 본문과 액션 snippet |
| `Tabs.svelte` | 선택된 탭은 이 컴포넌트의 `$state`. 각 탭의 본문은 부모가 넘긴 snippet이 그린다 |
| `DataList.svelte` | 목록 데이터는 부모가 주고, 한 줄의 모양은 snippet 파라미터로 받음 |

#### `study6/` — 공유 상태

**목적.** props를 여러 단계 내려 주지 않고 같은 상태를 여러 컴포넌트가 보게 합니다. 화면 파일과 `lib/`의 상태 모듈이 나뉩니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 데모를 한 화면에 배치 |
| `CounterDemo.svelte` | 모듈의 `counter`를 서로 다른 컴포넌트가 같이 증가·초기화 |
| `CartDemo.svelte` | `Cart` 클래스의 담기, 수량, 합계, localStorage 유지 |
| `ThemeProvider.svelte` | `provideTheme()`으로 테마 context를 열음 |
| `ThemeToggle.svelte` | context의 테마를 밝음/어두움으로 바꿈 |
| `ThemeLabel.svelte` | 트리 아래쪽에서 `useTheme()`으로 현재 테마 문구를 표시 |
| `ContextDemo.svelte` | Provider와 토글·라벨을 묶어 context가 트리를 따라 내려가는 것을 보여 줌 |
| `StoreDemo.svelte` | `svelte/store`의 `writable` / `derived`와 `$store` 문법으로 알림 목록 |
| `SetDemo.svelte` | `svelte/reactivity`의 반응형 Set으로 선택 항목을 토글 |
| `lib/counter.svelte.js` | 모듈 싱글톤 `counter`와, 인스턴스를 따로 만드는 `createCounter` |
| `lib/cart.svelte.js` | `$state` 필드를 가진 `Cart` 클래스와 공유 인스턴스 `cart`. 새로고침 후 복원 |
| `lib/theme.svelte.js` | `setContext` / `getContext` 래퍼 `provideTheme`, `useTheme` |
| `lib/notify.js` | `writable` 메시지 목록, `derived` 개수, `notify` / `dismiss` / `clearMessages` |
| `lib/persisted.svelte.js` | localStorage와 `$state`를 연결하는 `persisted(key, initial)` 헬퍼 |

`.svelte.js`(TS는 `.svelte.ts`)인 이유: 그 확장자여야 컴포넌트 밖 파일에서도 `$state` 같은 룬이 동작합니다. `notify.js`는 룬 대신 `svelte/store`만 쓰므로 일반 `.js`입니다.

#### `study7/` — 라우팅

**목적.** 주소가 화면을 고르게 하고, 로그인하지 않은 사용자를 막는 가드를 두 가지 구현으로 비교합니다. 페이지 컴포넌트는 한 벌만 두고 두 라우터가 같이 씁니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | “직접 만든 라우터”와 “라이브러리 라우터” 데모를 전환 |
| `data.js` | 사용자 목록 같은 실습용 정적 데이터 (`users`) |
| `auth.svelte.js` | 이 진도의 로그인 상태. `login(name)`, `logout()`. 게시판의 `AuthStore`보다 단순한 `$state` 객체 |
| `custom/router.svelte.js` | 해시 읽기, `matchPath(pattern, path)`, `RouterState`, `navigate`. 가드와 로그아웃이 겹칠 때의 경쟁 상태를 포함 |
| `custom/RouterView.svelte` | 현재 해시와 라우트 표를 보고 맞는 페이지를 그림 |
| `custom/NavLink.svelte` | 해시로 이동하는 링크. 현재 경로이면 활성 표시 |
| `custom/CustomRouterDemo.svelte` | 위 세 파일을 조립한 직접 구현 데모 |
| `library/LibraryRouterDemo.svelte` | 같은 페이지를 `svelte-spa-router`의 `Router`, `wrap`, `link`, `active`로 조립 |
| `pages/Home.svelte` | 라우트 `/` 안내 |
| `pages/Users.svelte` | 사용자 목록. 항목은 상세 주소로 이동 |
| `pages/UserDetail.svelte` | `/users/:id`. 주소 파라미터로 한 명을 찾음 |
| `pages/Admin.svelte` | 로그인한 경우만 통과하는 보호 페이지 |
| `pages/Login.svelte` | 이름 입력 후 `auth.login`. 가드에 막힌 뒤 돌아오는 흐름 |
| `pages/NotFound.svelte` | 표에 없는 경로 |

#### `study8/` — 폼과 API

**목적.** 서버 통신을 흉내 내어 로딩, 실패, 취소, 폼 검증, 낙관적 업데이트를 화면에 연결합니다. 호출 대상은 JSONPlaceholder이고, 테스트는 `src/tests/fakeApi.js`가 `fetch`를 대체합니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 데모를 한 화면에 배치 |
| `AwaitDemo.svelte` | `{#await}`의 pending / then / catch 세 갈래 |
| `ResourceDemo.svelte` | 필터가 바뀔 때 `createResource`로 다시 요청하고, 이전 요청은 `AbortSignal`로 취소 |
| `PostForm.svelte` | 제목·내용 검증을 `$derived`로 계산. blur 이후 오류 표시, 전송 중 버튼 잠금, 실패 시 입력 유지 |
| `PostManager.svelte` | 목록 표시, 작성, 삭제. 삭제·작성은 먼저 화면을 고치고 실패하면 롤백 |
| `lib/api.js` | `listPosts`, `getPost`, `createPost`, `deletePost`. `ApiError`, `signal`, 일부러 실패시키는 `fail` 옵션 |
| `lib/resource.svelte.js` | `data` / `loading` / `error`와 `load`, `abort`를 가진 `createResource(fetcher)` |

#### `study9/` — transition · action · 생명주기

**목적.** CSS 라이브러리 없이 등장·퇴장·재배치를 넣고, DOM 노드에 붙였다 떼는 로직을 액션으로 재사용합니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | 아래 데모를 한 화면에 배치 |
| `TransitionDemo.svelte` | `fade`, `fly`, `slide`, `scale`과 글자를 한 글자씩 드러내는 커스텀 `typewriter` |
| `FlipList.svelte` | 순서나 필터가 바뀔 때 `animate:flip`으로 항목이 자기 자리에서 미끄러짐 |
| `MotionDemo.svelte` | `svelte/motion`의 Tween/Spring으로 숫자나 위치가 목표값까지 부드럽게 변함 |
| `LifecycleDemo.svelte` | 부모가 자식을 붙였다 뗄 때 mount / effect / destroy 순서를 로그로 표시 |
| `LifeChild.svelte` | 위 데모가 붙이는 자식. 마운트와 해제 시점에 `log()`를 호출 |
| `ActionDemo.svelte` | 바깥 클릭, 자동 포커스, 길게 누르기 액션을 입력 칸과 버튼에 적용 |
| `lib/actions.js` | `clickOutside`, `clickOutsideAttach`, `autofocus`, `longpress`. 반환값의 `update`와 `destroy`로 리스너를 갱신·해제 |
| `lib/lifelog.svelte.js` | 여러 컴포넌트가 같이 보는 로그 배열. `log`, `clearLogs` |

#### `study10/` — 테스트 · 빌드 · SvelteKit 맛보기

**목적.** 새 인터랙션을 더하기보다, 이미 만든 실습이 테스트와 빌드 정보로 어떻게 확인되는지, SvelteKit에서는 어떤 파일로 바뀌는지를 보여 줍니다. 테스트 코드 본체는 `src/tests/`에 있습니다.

| 파일 | 기능 |
|---|---|
| `Lesson.svelte` | `BuildInfo`와 `MapTables`를 이어서 표시 |
| `BuildInfo.svelte` | `import.meta.env`의 `MODE`, `DEV`, `PROD`, `BASE_URL`, `VITE_APP_TITLE`을 표로 표시. dev와 preview에서 값이 달라지는 것을 확인 |
| `MapTables.svelte` | `data`의 두 배열을 표로 렌더 |
| `data.js` | `testMap`: 어떤 테스트 파일이 어떤 진도를 지키는지. `kitMap`: SPA 개념과 SvelteKit의 `+page.svelte`, `load`, form actions, hooks, `+server.js`, adapter 대응 |

### 3-3. `src/tests/`

**목적.** demo 앱의 자동 검사. `vite.config`의 `setupFiles`가 모든 테스트 전에 `setup.js`를 실행합니다. 컴포넌트 테스트는 Testing Library로 화면에 보이는 역할·텍스트를 찾고 클릭합니다.

| 파일 | 종류 | 기능 |
|---|---|---|
| `setup.js` | 준비 | jest-dom matcher, jsdom에 없는 `matchMedia` / `ResizeObserver` / Web Animations 보완, 매 테스트 후 `localStorage`와 `location.hash` 초기화 |
| `fakeApi.js` | 도우미 | `installFakeFetch()`로 `fetch`를 대체. study8 테스트가 네트워크 없이 지연·성공·실패를 재현 |
| `Counter.test.js` | 컴포넌트 | study2. 렌더, 클릭, 숫자 증가 |
| `Stepper.test.js` | 컴포넌트 | study3. props, 콜백, rerender, 경계에서 disabled |
| `TodoList.test.js` | 컴포넌트 | study4. 추가·삭제·필터, 빈 상태 |
| `cart.svelte.test.js` | 단위 | study6. `Cart`의 수량·합계와 localStorage 저장·복원 |
| `matchPath.test.js` | 단위 | study7. `matchPath` 순수 함수의 패턴과 파라미터 |
| `router.test.js` | 컴포넌트 | study7. 해시 이동, 가드, 로그아웃과 탐색이 겹칠 때의 경쟁 상태 |
| `resource.svelte.test.js` | 단위 | study8. 이전 요청을 취소하고 마지막 응답만 반영 |
| `PostManager.test.js` | 컴포넌트 | study8. 폼 검증, 낙관적 업데이트, 실패 시 롤백 |
| `actions.test.js` | 단위 | study9. 액션의 `update` / `destroy`와 리스너 해제 |
| `BuildInfo.test.js` | 컴포넌트 | study10. 환경 정보 표가 `import.meta.env` 값을 보여 주는지 |
| `lessons.smoke.test.js` | 스모크 | 목차의 모든 `Lesson`이 예외 없이 마운트되는지 |

---

## 4. `project/` — studyFinal 미니 게시판

**목적.** study1~10의 부품을 하나의 사용자 흐름으로 조립합니다. 학습용 목차는 없고, 게시판으로만 동작합니다. JS 앱 제목은 `미니 게시판 (JS)`, TS 앱 제목은 `미니 게시판 (TS)`입니다.

**기능.** 해시 라우팅으로 아래 화면을 전환합니다. 로그인과 글은 `localStorage`에 남아 새로고침 후에도 유지됩니다. 오른쪽 아래 토스트가 성공·실패를 알립니다.

| 화면 | 주소 | 기능 |
|---|---|---|
| 글 목록 | `#/` | 최신순 5개, 제목·내용·작성자 검색, 페이지 이동, 검색어 `<mark>` 강조 |
| 글 상세 | `#/posts/3` | 본문, 조회수 증가. 작성자에게만 수정·삭제. 삭제는 화면 안의 확인 단계 |
| 글쓰기 | `#/write` | 로그인 가드. 검증, 전송 중 잠금 |
| 글 수정 | `#/posts/3/edit` | 로그인 + API의 작성자 검사. 기존 글로 폼을 시작 |
| 로그인 | `#/login` | 실패 메시지. 성공하면 `?redirect=`가 허용한 앱 안 경로로 `replace` |
| 404 | 그 외 | 안내와 목록으로 돌아가는 링크 |

가드에 막히면 `App.svelte`의 `onConditionsFailed`가 `/login?redirect=<원래 주소>`로 보냅니다. `safeRedirect`는 `https://…`, `//호스트`처럼 앱 밖 주소를 `/`로 바꿉니다.

### 4-1. 앱 루트 파일

demo와 같은 종류의 설정 파일입니다. 패키지 이름과 `index.html` 제목, 라우터를 항상 쓰는 점만 다릅니다.

| 파일 | 목적 | 기능 |
|---|---|---|
| `index.html` | 문서 껍데기 | `#app`과 `src/main.js`(TS는 `main.ts`) 연결 |
| `package.json` | `svelte-js-board` / `svelte-ts-board` | scripts는 demo와 동일. TS만 `check` |
| `package-lock.json` | 설치 고정 | demo와 별도 트리. 앱마다 `npm install`이 필요합니다 |
| `svelte.config.js` | 컴파일러 설정 | 빈 `{}` |
| `vite.config.js` / `.ts` | 번들러와 테스트 | demo와 같이 `svelte()`, `svelteTesting()`, jsdom, `src/tests/setup` |
| `jsconfig.json` 또는 `tsconfig*.json` | 에디터·`npm run check` | demo와 같은 역할. project에는 `env.d.ts`가 없음 |
| `public/favicon.svg` | 정적 아이콘 | `/favicon.svg` |
| `src/main.js` / `main.ts` | 시작점 | `mount(App)` |
| `src/app.css` | 전역 스타일 | 게시판 레이아웃, 목록, 폼, 토스트에 쓰는 공통 값 |
| `src/App.svelte` | 라우트 표와 레이아웃 | `/`, `/posts/:id`, `/posts/:id/edit`, `/write`, `/login`, `*`. 글쓰기·수정은 `wrap({ conditions: [requireLogin] })`. `Header`, `Router`, `Toast`를 배치 |

역할은 세 층입니다.

- `lib/`는 화면을 모릅니다. 권한, 검색 문자열 나누기, 저장, 비동기 상태.
- `components/`는 props만 받아 그립니다. 데이터가 어디서 왔는지 모릅니다.
- `routes/`가 `createResource`로 데이터를 불러와 컴포넌트를 조립합니다.

### 4-2. `src/lib/`

| 파일 | 목적 | 기능 |
|---|---|---|
| `api.js` | 가짜 백엔드 | `login`, `listPosts`, `getPost`, `createPost`, `updatePost`, `deletePost`, `resetDb`, `config.latency`, `ApiError`. 약 150ms 지연, `AbortSignal`, localStorage 키 `board-posts`. 시드 12개. 비로그인 401, 작성자가 아니면 수정·삭제 403, 없는 글 404. 화면이 버튼을 숨겨도 이 검사가 최종 방어 |
| `auth.svelte.js` | 로그인 스토어 | `AuthStore`. `user`를 `board-user` 키에서 복원, `isLoggedIn`, `login`, `logout`. 모듈 싱글톤 `auth` |
| `toast.svelte.js` | 알림 스토어 | `toasts`, `notify(message, type, duration)`, `dismiss`. 기본 2.5초 후 닫힘 |
| `resource.svelte.js` | 비동기 상태 | `createResource`. 새 요청 중에도 이전 `data`를 유지하고, cleanup에서 `abort` |
| `storage.js` | JSON 저장 | `readJson(key, fallback)`, `writeJson`, `removeKey`. 깨진 JSON은 fallback |
| `text.js` | 순수 문자열 | `splitByQuery`는 대소문자 무시로 검색어 조각을 나누고 match 표시를 붙임. 정규식 특수문자에 안전. `formatDate`는 ISO 시각을 읽기 좋은 문자열로 |
| `redirect.js` | 열린 리다이렉트 방지 | `safeRedirect`. 앱 안 절대 경로만 허용하고 그 외는 `/` |

### 4-3. `src/components/`

| 파일 | 목적 | 기능 |
|---|---|---|
| `Header.svelte` | 공통 상단 | 목록·글쓰기 링크, 현재 메뉴 강조, 로그인한 이름, 로그아웃 |
| `SearchBar.svelte` | 검색 입력 | 치는 중인 `draft`와 주소에 반영된 검색어를 분리. 제출 시 `onsearch` |
| `PostList.svelte` | 목록 마크업 | 제목 링크, 작성자, 날짜, 조회수. `splitByQuery`로 검색어만 `<mark>` |
| `Pagination.svelte` | 페이지 링크 | `hrefFor(page)` prop으로 주소를 만들고, 현재 페이지를 표시 |
| `PostForm.svelte` | 글쓰기·수정 공용 폼 | 제목·내용 `bind`, blur 이후 오류, 제출 시 전체 오류, 공백 정리, 전송 중 잠금, 서버 오류 `role="alert"`, 입력 유지. `onsubmit`은 부모가 준 async 함수 |
| `Toast.svelte` | 알림 표시 | `toasts`를 구독. `in:fly` / `out:fly` / `animate:flip`. 영역 이름은 `aria-label="알림"` |

### 4-4. `src/routes/`

| 파일 | 목적 | 기능 |
|---|---|---|
| `Home.svelte` | 목록 페이지 | 쿼리의 `q`, `page`를 `$derived`로 읽고 `$effect`에서 `listPosts`. 로딩 중에는 이전 목록을 흐리게 (`aria-busy`). 빈 검색·1페이지는 쿼리에서 생략해 `#/`를 유지 |
| `PostDetail.svelte` | 상세 | `getPost`. 작성자이면 수정 링크와 삭제 확인. 본문은 이스케이프되는 `{ }` 출력. 다른 글로 가면 삭제 확인 상태는 닫힘 |
| `PostWrite.svelte` | 작성 | 가드를 통과한 뒤 `PostForm` → `createPost` → 새 글 상세로 이동 |
| `PostEdit.svelte` | 수정 | 글을 먼저 불러온 다음 폼을 만들어 초기값이 기존 내용이 되게 함. `updatePost` |
| `Login.svelte` | 로그인 | `auth.login`. 실패 문구. 성공 시 `safeRedirect` 결과로 `replace`해서 로그인 화면이 히스토리에 남지 않음 |
| `NotFound.svelte` | 없는 주소 | 안내와 목록 링크 |

### 4-5. `src/tests/`

**목적.** 게시판이 50개의 검사로 권한, 주소, 폼, 화면 흐름을 지킵니다. `npm test`가 이 폴더를 실행합니다. 통합 테스트는 모듈 싱글톤인 `auth`와 `toasts`를 `afterEach`에서 비우고, 해시 변경이 처리된 뒤 다음 테스트로 넘어갑니다.

| 파일 | 종류 | 지키는 기능 |
|---|---|---|
| `setup.js` / `setup.ts` | 준비 | demo와 같이 jest-dom, jsdom에 없는 API, 테스트 사이 저장소·해시 정리 |
| `lib.test.js` | 단위 | `splitByQuery`(대소문자, 여러 번, 특수문자), `formatDate`, `safeRedirect`의 악성 값 |
| `api.test.js` | 단위 | 로그인 401, 검색과 페이지 보정, 조회수, 작성·수정·삭제 권한 403/401/404, 깨진 저장 데이터 복구 |
| `auth.svelte.test.js` | 단위 | 로그인 성공·실패·로그아웃, 모듈을 다시 불러도 로그인 유지 |
| `PostForm.test.js` | 컴포넌트 | 초기값, blur 후 오류, 검증 실패 시 미전송, 공백 정리, 중복 제출 방지, 서버 오류 표시 |
| `App.test.js` | 통합 | 목록→검색→페이지→상세, 가드와 redirect 복귀, 로그인 실패, 작성→상세→삭제, 수정, 타인 글에 수정·삭제가 없는지, 주소로 직접 들어가도 막히는지, 404 |

---

## 5. 어떤 폴더를 열면 되는가

| 하고 싶은 일 | 열 곳 |
|---|---|
| Svelte가 왜 컴파일러인지, 룬이 무엇인지 | `study0.md` |
| 오늘 진도의 설명과 확인 문제 | `studyN.md` |
| 그 진도를 브라우저에서 조작 | `JS_study/demo` 또는 `TS_study/demo`의 `src/lessons/studyN/` |
| 그 진도의 자동 검사 | `*/demo/src/tests/` 가운데 study10 `testMap`에 적힌 파일 |
| 타입만 다른 같은 코드를 비교 | 같은 상대 경로의 `JS_study/...`와 `TS_study/...` |
| 진도를 한 제품으로 이은 결과 | `*/project/src/`와 `studyFinal.md` |
| 의존성 설치와 개발 서버 | 보려는 앱 폴더에서 `npm install`, `npm run dev` |

실습을 수정할 때는 그 앱의 `src/`만 고칩니다. `node_modules/`와 `dist/`는 다시 생성되는 결과물입니다.
