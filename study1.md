# study1. 프로젝트 만드는 방법 · 명령어 · 실습1

> 이전: [study0](./study0.md) — 이론
> 이번 목표: **Svelte + Vite 프로젝트를 직접 만들고, 첫 컴포넌트를 화면에 띄운다.**
> 실습 코드: `JS_study/demo/src/lessons/study1/` , `TS_study/demo/src/lessons/study1/`

---

## 1. 준비물 확인

```bash
node -v    # v20 이상 권장 (이 저장소는 v24로 작성)
npm -v
```

Node.js가 없다면 https://nodejs.org 에서 LTS 버전을 설치합니다.

---

## 2. 프로젝트 만들기

### 2-1. Vite 템플릿으로 만들기 (이 저장소의 방식)

```bash
# JavaScript
npm create vite@latest demo -- --template svelte

# TypeScript
npm create vite@latest demo -- --template svelte-ts
```

- `demo` : 만들어질 폴더 이름 (원하는 이름으로 바꿔도 됨)
- `--template svelte` / `svelte-ts` : 언어 선택
- `--` 뒤의 옵션은 npm이 아니라 `create-vite`에 전달된다. (빠뜨리면 템플릿 지정이 무시되니 주의)
- 옵션 없이 `npm create vite@latest`만 치면 질문이 나오고, 방향키로 **Svelte → JavaScript/TypeScript**를 고르면 된다.

이 저장소에서는 이렇게 만들었습니다.

```bash
cd JS_study && npm create vite@latest demo -- --template svelte
cd TS_study && npm create vite@latest demo -- --template svelte-ts
```

### 2-2. (참고) 공식 CLI `sv`

```bash
npx sv create my-app
```

Svelte 팀의 공식 CLI입니다. **SvelteKit** 프로젝트를 만들 때 주로 쓰며, 이 저장소의 마지막 단계(study10)에서 다시 만납니다.
Vite SPA와 SvelteKit은 `.svelte` 문법은 같고, 라우팅·서버 기능만 다릅니다.

---

## 3. 자주 쓰는 명령어

```bash
cd demo
npm install        # package.json에 적힌 의존성 설치 (처음 한 번, 또는 새로 clone했을 때)
npm run dev        # 개발 서버 실행 → http://localhost:5173
npm run build      # 배포용 빌드 → dist/ 폴더 생성
npm run preview    # 빌드 결과를 로컬에서 미리보기
npm run check      # (TS 프로젝트) svelte-check로 타입 검사
```

| 명령어 | 언제 쓰나 | 결과 |
|---|---|---|
| `npm install` | 프로젝트를 처음 받았을 때 | `node_modules/` 생성 |
| `npm run dev` | 개발할 때 항상 | 저장하면 브라우저가 즉시 갱신 (HMR) |
| `npm run build` | 배포 전, 또는 문법 오류 점검 | 컴파일 결과가 `dist/`에 생성 |
| `npm run preview` | 빌드 결과 확인 | 실제 배포와 가장 비슷한 환경 |
| `npm run check` | TS 프로젝트에서 타입 검사 | 에러·경고 개수 출력 |

패키지를 추가할 때는 `npm install 패키지명`, 개발 전용이면 `npm install -D 패키지명`.

> `node_modules/`와 `dist/`는 용량이 크고 언제든 다시 만들 수 있어서 **git에 올리지 않습니다.** (`.gitignore`에 등록됨)

---

## 4. 폴더 구조 읽기

```
demo/
├─ index.html            ← 유일한 HTML. <div id="app"> 와 main 파일 연결
├─ package.json          ← 의존성, 명령어(scripts)
├─ svelte.config.js      ← Svelte 컴파일러 설정
├─ vite.config.js        ← Vite 설정 (svelte() 플러그인 등록)
├─ public/               ← 가공 없이 그대로 서비스되는 정적 파일 (favicon 등)
└─ src/
   ├─ main.js            ← 시작점: App을 #app 에 붙인다
   ├─ app.css            ← 전역 스타일
   ├─ App.svelte         ← 최상위 컴포넌트
   └─ lessons/           ← (이 저장소 전용) 진도별 실습 폴더
```

TS 프로젝트는 `main.ts`, `vite.config.ts`, `tsconfig*.json`이 추가됩니다.

### 실행 흐름

```
index.html ──<script src="/src/main.js">──▶ main.js
                                              │  mount(App, { target: #app })
                                              ▼
                                        App.svelte ──▶ 하위 컴포넌트들
```

```js
// src/main.js
import { mount } from 'svelte'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})
```

> Svelte 4 이전에는 `new App({ target })`이었지만, Svelte 5부터는 **`mount()`** 를 씁니다.
> React의 `createRoot(el).render(<App />)`, Vue의 `createApp(App).mount('#app')`와 같은 역할입니다.

---

## 5. 이 저장소의 App 구조 (실습 목차)

처음 만들면 Vite 로고가 있는 샘플 화면이 나옵니다. 학습에 방해되어 지우고, **진도를 클릭해서 고르는 목차 화면**으로 바꿨습니다.

- `src/lessons/index.js` : 진도 목록 `[{ id, title, component }]`
- `src/App.svelte` : 왼쪽에 목차, 오른쪽에 선택한 진도 컴포넌트를 렌더링

```svelte
<script>
  import { lessons } from './lessons/index.js'
  let currentId = $state(lessons[0].id)                    // 선택된 진도
  const current = $derived(lessons.find((l) => l.id === currentId))
  const Lesson = $derived(current.component)               // 컴포넌트를 변수에 담아서
</script>

<Lesson />                                                  <!-- 이렇게 바로 렌더링 -->
```

지금은 `$state`/`$derived`를 "그런가 보다" 하고 넘어가도 됩니다. study2에서 자세히 배웁니다.
앞으로 새 진도마다 `src/lessons/studyN/` 폴더가 하나씩 늘어나고, `index.js`에 한 줄이 추가됩니다.

---

## 6. 실습1 — 첫 컴포넌트와 템플릿

파일: `src/lessons/study1/Lesson.svelte`, `Greeting.svelte`

### 6-1. 텍스트 보간 `{ }`

```svelte
<script>
  const title = 'Hello, Svelte!'
  const user = { name: '홍길동', level: 1 }
</script>

<p>{title}</p>
<p>{user.name}님의 레벨은 {user.level}입니다.</p>
```

- 중괄호 `{}` 안에는 **JavaScript 표현식**이 들어갑니다. (Vue의 `{{ }}`, React JSX의 `{ }`와 비슷)
- 문장(`if`, `for`)은 못 쓰고, 값이 나오는 식만 가능합니다: `{1 + 2}`, `{fn(3)}`, `{ok ? 'A' : 'B'}`

### 6-2. 속성 바인딩

```svelte
<img src={imageUrl} alt="로고" />
<img {src} alt="로고" />      <!-- 속성명과 변수명이 같으면 축약 -->
```

속성 값에도 `{}`를 쓰고, **따옴표는 붙이지 않습니다.** (`src="{imageUrl}"`도 동작하지만 `src={imageUrl}`이 관례)

### 6-3. 컴포넌트 안에 컴포넌트

```svelte
<script>
  import Greeting from './Greeting.svelte'
</script>

<Greeting name="Svelte" />
<Greeting name={user.name} />
```

- 컴포넌트 이름은 **대문자로 시작**해야 일반 HTML 태그와 구분됩니다.
- `Greeting.svelte`는 `let { name } = $props()`로 값을 받습니다. (props는 study3)

### 6-4. 스타일 스코프

```svelte
<!-- Greeting.svelte -->
<style>
  p { color: seagreen; }   <!-- Greeting 안의 p에만 적용 -->
</style>
```

같은 화면의 부모 `<p>`는 영향을 받지 않습니다. 컴파일러가 `p`에 `svelte-xyz123` 같은 고유 클래스를 붙여서 범위를 제한하기 때문입니다. 브라우저 개발자도구에서 요소를 열어 보면 확인됩니다.

### 6-5. `{@html}`

```svelte
{@html '<em>강조</em>'}
```

문자열을 HTML로 해석해서 넣습니다. **사용자 입력에는 절대 쓰지 마세요** (스크립트 삽입 공격, XSS).

---

## 7. TypeScript 버전은 무엇이 다른가

`TS_study/demo`는 JS 버전과 **같은 화면**을 만들되 아래만 다릅니다.

```svelte
<script lang="ts">                         <!-- lang="ts" 추가 -->
  interface User { name: string; level: number }
  const user: User = { name: '홍길동', level: 1 }
  function double(n: number): number { return n * 2 }
</script>
```

```svelte
<!-- props에 타입 지정 (Greeting.svelte) -->
<script lang="ts">
  let { name }: { name: string } = $props()
</script>
```

- 타입 검사는 `npm run check` 로 합니다. (`npm run dev`/`build`는 타입 에러가 있어도 동작할 수 있음)
- `main.ts`의 `document.getElementById('app')!` 에서 `!`는 "null이 아님을 내가 보장한다"는 표시입니다.

---

## 8. Vue / React와 비교

| 항목 | React | Vue | Svelte |
|---|---|---|---|
| 프로젝트 생성 | `npm create vite@latest -- --template react` | `npm create vue@latest` | `npm create vite@latest -- --template svelte` |
| 시작점 | `createRoot(el).render(<App/>)` | `createApp(App).mount('#app')` | `mount(App, { target })` |
| 텍스트 보간 | `{value}` | `{{ value }}` | `{value}` |
| 속성 바인딩 | `src={url}` | `:src="url"` | `src={url}` |
| 컴포넌트 파일 | 함수가 JSX 반환 | `<template>` + `<script>` | 마크업이 파일 본문 |
| 스타일 범위 | 별도 방식 필요 | `<style scoped>` | `<style>`이 기본 스코프 |

---

## 9. 정리

- `npm create vite@latest 이름 -- --template svelte` (TS는 `svelte-ts`)
- `npm install` → `npm run dev` 로 개발, `npm run build`로 검증/배포 빌드
- 시작점은 `main.js`의 `mount(App, ...)`, 화면은 `App.svelte`부터 시작
- 템플릿은 `{}` 안에 JS 표현식을 쓰고, 컴포넌트는 대문자로 시작, `<style>`은 자동 스코프

## 확인 문제

1. `npm create vite@latest demo -- --template svelte`에서 `--`는 왜 필요한가?
2. `main.js`에서 `mount()`가 하는 일은?
3. `{}` 안에 `if (a) {...}` 문장을 쓸 수 없는 이유는?
4. 부모와 자식 컴포넌트에 둘 다 `p { color: red }`가 있으면 서로 영향을 주는가?
5. `node_modules/`와 `dist/`를 git에 올리지 않는 이유는?

## 직접 해보기

- `Lesson.svelte`의 `user.name`을 본인 이름으로 바꾸고 저장 → 브라우저가 즉시 바뀌는지 확인 (HMR)
- `Greeting`을 세 번 더 사용해 보고, 각각 다른 `name`을 넘겨 보기
- `<style>`에서 `p` 색을 바꾸고 개발자도구로 `svelte-` 클래스가 붙는 것 확인
