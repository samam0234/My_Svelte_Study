# 에이전트 공통 가이드라인 (인수인계 문서)

이 문서는 이 저장소에서 작업하는 모든 AI 에이전트(Claude, Grok, Codex 등)가 **공통으로** 지켜야 할 규칙을 정리한 인수인계 문서입니다.
`.claude/`, `.grok/`, `.codex/` 폴더의 에이전트별 문서는 이 문서를 기본으로 삼고, 도구별 특이사항만 추가로 기술합니다.

## 1. 저장소 개요

- Svelte 5(Vite) 학습 기록 저장소입니다. 순서는 이론 → 기초 실습 → 고급 기술 → 응용 프로젝트입니다.
- 루트의 학습 문서는 `study0.md` ~ `study10.md`, `studyFinal.md` 순서로 진행됩니다. (숫자가 클수록 최신 진도)
  - `study0.md`: Svelte 기초 이론
  - `study1.md`: 프로젝트 생성 방법 및 명령어, 실습1
  - `study2.md` ~ `study5.md`: 실습2 ~ 실습5
  - `study6.md` ~ `study10.md`: 고급 기술 구현 1 ~ 5
  - `studyFinal.md`: 지금까지 배운 것을 응용한 미니 게시판 프로젝트
- 실습 코드는 언어별 전용 폴더로 분리합니다. 두 폴더는 서로 독립이라 각자 작업할 수 있습니다.
  - `JS_study/demo/`: study1~study10. JavaScript로 개념을 하나씩 쌓는 기초·고급 실습입니다.
  - `JS_study/project/`: `studyFinal.md`에 대응하는 JavaScript 미니 게시판입니다.
  - `TS_study/demo/`: study1~study10을 TypeScript(`lang="ts"`)로 작성한 실습입니다. JS 원본은 덮어쓰지 않습니다.
  - `TS_study/project/`: `studyFinal.md`에 대응하는 TypeScript 미니 게시판입니다.
- `demo`는 `src/lessons/studyN/` 폴더 단위로 진도를 쌓고, `App.svelte`의 목차에서 진도를 골라 실행합니다.

## 2. 작업 전 확인 사항

- 새 작업을 시작하기 전에 `studyN.md` 파일들을 번호 순서대로 확인하여 지금까지의 학습 진도와 맥락을 파악합니다.
- 실습 코드가 study 문서 설명과 어긋나지 않는지 확인합니다. study1~10은 `JS_study/demo`·`TS_study/demo`의 `src/lessons/studyN/`, studyFinal은 `JS_study/project`·`TS_study/project`입니다.
- 새 studyN.md 문서를 추가/수정할 때는 이전 study 문서와 이어지는 흐름을 유지합니다.
- 코드는 Svelte 5 문법(runes: `$state`, `$derived`, `$effect`, `$props`)을 기본으로 합니다. 옛 문법(`$:`, `export let`)은 비교 설명용으로만 다룹니다.

## 3. 커밋 규칙

- 커밋 관련 규칙은 [COMMIT_GUIDE.md](./COMMIT_GUIDE.md) 문서를 따릅니다.

## 4. 언어 규칙

- 문서 내용, 커밋 설명: 한글
- 커밋 타입(prefix), 코드, 식별자, 파일명: 영어

## 5. 에이전트별 문서

- Claude: [.claude/CLAUDE.md](../.claude/CLAUDE.md)
- Grok: [.grok/GROK.md](../.grok/GROK.md)
- Codex: [.codex/AGENTS.md](../.codex/AGENTS.md)

## 6. 인수인계 원칙

- 작업을 마칠 때는 다음 에이전트/세션이 이어받을 수 있도록 변경 내용과 다음 단계 후보를 간단히 남깁니다.
- 불확실한 결정은 추측하지 말고 study 문서 내용을 근거로 삼습니다.
- 이 문서나 커밋 가이드에 없는 새로운 컨벤션이 필요해지면, 추측해서 각자 다르게 처리하지 말고 이 문서를 먼저 갱신합니다.

## 7. 현재 진행 현황 (2026-10-19 기준)

- `study0.md` ~ `study10.md`, `studyFinal.md` 작성 완료. 각 진도마다 JS/TS 실습 코드가 대응합니다.
- 실행 방법: 각 프로젝트 폴더(`JS_study/demo`, `TS_study/demo`, `JS_study/project`, `TS_study/project`)에서 `npm install` → `npm run dev` / `npm test` / `npm run build`. TS 폴더는 `npm run check`(타입 검사)도 있습니다.
- 검증 상태: demo는 테스트 58개씩, project는 50개씩 통과. TS는 `svelte-check` 오류 0.
- `demo`의 `src/lessons/index.js|ts`가 진도 목록입니다. 새 진도를 추가할 때는 `src/lessons/studyN/` 폴더와 이 목록 한 줄을 함께 추가합니다.
- JS와 TS는 **같은 내용을 서로 다른 언어로** 작성합니다. 한쪽을 고치면 다른 쪽에도 반영하고, 대응하는 study 문서의 설명도 확인합니다.
- 테스트는 사용자 관점(Testing Library)으로 작성하고, 새 테스트는 코드를 일부러 망가뜨려 실패하는지(변이 확인) 확인합니다. (study10 참고)

### 다음 단계 후보

- SvelteKit 프로젝트(`SvelteKit_study/` 등)를 새로 만들어 `studyFinal`의 게시판을 `load()` / form actions 기반으로 이전
- 게시판 댓글, 내 글만 보기, 페이지 크기 선택 등 `studyFinal.md`의 도전 과제
- 실제 백엔드(Node/Express 또는 SvelteKit `+server.js`)와 연결

