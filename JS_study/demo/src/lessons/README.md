# lessons

진도별 실습 화면입니다. `App.svelte`가 이 목록만 보고 목차를 만듭니다.

- 저장소 전체: [README.md](../../../../README.md)
- 상위 폴더: [README.md](../README.md)

## 목적

한 진도를 폴더 하나로 격리합니다. 새 진도를 넣을 때는 폴더를 만들고 `index.js`에 `{ id, title, component }` 한 줄을 추가합니다. study0은 이론 문서만 있고, studyFinal은 [`project/`](../../../project/README.md) 앱이라 이 목차에 없습니다.

## 파일

| 파일 | 기능 |
|---|---|
| `index.js` | study1~study10의 `Lesson.svelte`를 모아 목차 배열로 export |

## 진도 폴더

| 폴더 | 문서 | 화면에서 다루는 것 |
|---|---|---|
| [study1](./study1/README.md) | [study1.md](../../../../study1.md) | 첫 컴포넌트와 `{ }` 템플릿 |
| [study2](./study2/README.md) | [study2.md](../../../../study2.md) | `$state`, `$derived`, `$effect` |
| [study3](./study3/README.md) | [study3.md](../../../../study3.md) | props, 콜백, `bind:` |
| [study4](./study4/README.md) | [study4.md](../../../../study4.md) | `{#if}`, `{#each}`, 검색·정렬 |
| [study5](./study5/README.md) | [study5.md](../../../../study5.md) | `children`, snippet, 합성 |
| [study6](./study6/README.md) | [study6.md](../../../../study6.md) | 모듈 상태, 클래스, context, store |
| [study7](./study7/README.md) | [study7.md](../../../../study7.md) | 직접 만든 라우터와 `svelte-spa-router` |
| [study8](./study8/README.md) | [study8.md](../../../../study8.md) | `fetch`, 취소, 폼, 낙관적 업데이트 |
| [study9](./study9/README.md) | [study9.md](../../../../study9.md) | transition, action, 생명주기 |
| [study10](./study10/README.md) | [study10.md](../../../../study10.md) | 테스트 지도, 빌드 환경, SvelteKit 대응 |

목차에서 고르면 주소는 `?lesson=studyN`입니다. 각 폴더의 `Lesson.svelte`가 그 진도의 진입 컴포넌트입니다.
