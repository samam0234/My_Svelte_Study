# project — 미니 게시판 (TS)

study1~10을 하나의 게시판으로 조립한 Vite + Svelte 5 SPA입니다. 패키지 이름은 `svelte-ts-board`이고, 브라우저 제목은 "미니 게시판 (TS)"입니다. 설계 설명은 [studyFinal.md](../../studyFinal.md)입니다.

JavaScript로 같은 게시판은 [`JS_study/project`](../../JS_study/project/README.md)입니다.

- 저장소 전체: [README.md](../../README.md)
- 상위 폴더: [README.md](../README.md)
- studyFinal 문서: [studyFinal.md](../../studyFinal.md)

## 목적

목록, 상세, 검색, 페이지, 로그인, 글쓰기, 수정, 삭제가 있는 작은 제품을 만듭니다. 학습용 목차는 없습니다. 데이터와 로그인은 브라우저 `localStorage`에 남습니다. 비밀번호가 프런트 코드에 있는 것은 학습용이며, 실제 서비스에서는 서버가 검증합니다.

데모 계정은 `hong` / `1234`, `kim` / `1234`입니다.

## 기능

해시 라우팅(`#/...`)으로 화면이 바뀝니다.

| 화면 | 주소 | 하는 일 |
|---|---|---|
| 글 목록 | `#/` | 최신순 5개, 제목·내용·작성자 검색, 페이지, 검색어 `<mark>` |
| 글 상세 | `#/posts/3` | 본문, 조회수. 작성자에게만 수정·삭제. 삭제는 화면 안의 확인 |
| 글쓰기 | `#/write` | 로그인 가드, 검증, 전송 중 잠금 |
| 글 수정 | `#/posts/3/edit` | 로그인 가드와 API의 작성자 검사 |
| 로그인 | `#/login` | 실패 문구. 성공하면 가려던 앱 안 경로로 `replace` |
| 404 | 그 외 | 안내와 목록 링크 |

가드에 막히면 `/login?redirect=<원래 주소>`로 이동합니다. `safeRedirect`는 앱 안 경로만 허용합니다. 오른쪽 아래 토스트가 결과를 알립니다.

검색어와 페이지의 원본은 주소입니다. `$state`로 따로 들고 있지 않아서 새로고침, 뒤로가기, 링크 공유가 주소만으로 됩니다.

## 실행

```bash
cd TS_study/project
npm install
npm run dev        # http://localhost:5173
npm test           # 문서 기준 50개
npm run build
npm run preview
```

`npm run check`로 타입을 검사합니다. 도메인 타입은 `src/lib/api.ts`의 `User`, `Post`, `PostInput`, `PostPage`입니다.

## 이 폴더의 구성

| 경로 | 설명 |
|---|---|
| [src](./src/README.md) | 화면과 로직 |
| [public](./public/README.md) | `favicon.svg` |
| [.vscode](./.vscode/README.md) | Svelte 확장 권장 |
| `index.html` | `#app`과 `/src/main.ts` 연결 |
| `package.json` | scripts와 `svelte-spa-router` |
| `package-lock.json` | demo와 별도인 의존성 잠금 |
| `svelte.config.js` | 빈 컴파일러 설정 `{}` |
| `vite.config.ts` | demo와 같은 Vite·Vitest 설정. setup은 `src/tests/setup.ts` |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | `tsconfig.json`은 `tsconfig.app.json`(앱 소스)과 `tsconfig.node.json`(`vite.config.ts`)을 연결만 합니다. `tsconfig.app.json`은 `@tsconfig/svelte`를 확장하고 `src`의 `.ts`, `.js`, `.svelte`를 검사합니다. `npm run check`가 `svelte-check`와 `tsc`를 돌립니다. |

역할은 세 층입니다. `src/lib`는 화면을 모르고, `src/components`는 props만 받아 그리며, `src/routes`가 데이터를 불러와 조립합니다.
