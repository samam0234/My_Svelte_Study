# src — 실습 앱 소스 (JS)

브라우저에 올라가는 실습 앱의 소스입니다.

- 저장소 전체: [README.md](../../../README.md)
- 상위 폴더: [README.md](../README.md)

## 목적

시작점, 전역 스타일, 진도 목차, 진도별 화면, 테스트를 한곳에 둡니다.

## 구성

| 경로 | 기능 |
|---|---|
| `main.js` | `app.css`를 읽고 `mount(App, { target: #app })`. Svelte 5의 기동 |
| `app.css` | 전역 색, 글자, 버튼, `.card`, `.row`. 컴포넌트 `<style>`은 그 파일 안으로 제한 |
| `App.svelte` | 왼쪽 진도 목차와 오른쪽 본문. `?lesson=`과 선택 상태를 맞춤 |
| [lessons](./lessons/README.md) | study1~study10 화면 |
| [tests](./tests/README.md) | Vitest 테스트와 jsdom 준비 |

컴포넌트는 `<script>`를 씁니다. 같은 파일의 TypeScript 버전은 `TS_study/demo/src/`에 있습니다.
