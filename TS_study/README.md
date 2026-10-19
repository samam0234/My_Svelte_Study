# TS_study

TypeScript로 쓴 Svelte 5 학습 트랙입니다. 화면과 기능은 `JS_study/`(JavaScript)와 같고, 소스 확장자와 타입 검사만 다릅니다.

- 저장소 전체: [README.md](../README.md)

## 목적

루트의 `study1.md`~`study10.md` 실습과 `studyFinal.md` 게시판을 TypeScript로 실행할 수 있게 둡니다. 이 폴더 자체는 npm 프로젝트가 아닙니다. 실행은 아래 두 앱 폴더 안에서 합니다.

## 들어 있는 앱

| 폴더 | 패키지 | 문서 | 하는 일 |
|---|---|---|---|
| [demo](./demo/README.md) | `svelte-ts-demo` | study1~study10 | 왼쪽 목차로 진도를 고르는 실습 앱. 브라우저 제목은 "Svelte 학습 (TS)" |
| [project](./project/README.md) | `svelte-ts-board` | studyFinal | 목록·상세·검색·로그인이 있는 미니 게시판. 브라우저 제목은 "미니 게시판 (TS)" |

두 앱은 서로 의존하지 않습니다. 의존성도 따로라서 각 폴더에서 `npm install`을 실행합니다. 개발 서버 기본 포트는 둘 다 5173이라, 한 번에 하나의 `npm run dev`만 띄웁니다.

## JavaScript 트랙과의 대응

| 여기 | 같은 기능의 JavaScript |
|---|---|
| `TS_study/demo` | `JS_study/demo` |
| `TS_study/project` | `JS_study/project` |
| `.ts`, `.svelte.ts` | 반대 트랙의 확장자 |
| 컴포넌트 스크립트 `<script lang="ts">` | 반대 트랙의 스크립트 속성 |

같은 상대 경로를 나란히 열면 언어 차이만 보입니다. 예를 들어 할 일 목록은 `demo/src/lessons/study4/TodoList.svelte`입니다.
