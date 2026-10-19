# tests — 실습 앱 테스트 (TS)

`npm test`가 실행하는 Vitest 파일입니다. 설정은 앱 루트의 `vite.config.ts`에 있습니다. `environment`는 jsdom이고, `setupFiles`는 `setup.ts`이며, 포함 패턴은 `src/**/*.{test,spec}.ts`입니다.

- 저장소 전체: [README.md](../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study10 문서: [study10.md](../../../../study10.md)

## 목적

진도에서 만든 동작이 나중에 고쳐도 유지되는지 확인합니다. 컴포넌트 테스트는 Testing Library로 화면에 보이는 역할과 글자를 찾고 클릭합니다.

## 파일

| 파일 | 기능 |
|---|---|
| `setup.ts` | jest-dom matcher. jsdom에 없는 `matchMedia`, `ResizeObserver`, Web Animations를 채움. 매 테스트 후 `localStorage`와 `location.hash`를 비움 |
| `fakeApi.ts` | `installFakeFetch()`로 `fetch`를 대체. study8이 네트워크 없이 지연·성공·실패를 재현 |
| `Counter.test.ts` | study2. 렌더, 클릭, 숫자 증가 |
| `Stepper.test.ts` | study3. props, 콜백, rerender, 경계에서 disabled |
| `TodoList.test.ts` | study4. 추가, 공백 거절, 완료·진행 중 필터, 체크, 삭제, 빈 목록 |
| `cart.svelte.test.ts` | study6. `Cart` 수량·합계와 localStorage. 파일명에 svelte가 있어 룬 모듈을 불러옴 |
| `matchPath.test.ts` | study7. `matchPath`의 패턴과 파라미터 |
| `router.test.ts` | study7. 해시 이동, 404, `aria-current`, 마운트 시 주소 동기화, `/admin` 가드, 로그아웃 경쟁 상태 |
| `resource.svelte.test.ts` | study8. 이전 요청을 취소하고 마지막 응답만 반영 |
| `PostManager.test.ts` | study8. 폼 검증, 낙관적 업데이트, 실패 시 롤백 |
| `actions.test.ts` | study9. 액션의 `update` / `destroy`와 리스너 해제 |
| `BuildInfo.test.ts` | study10. 환경 정보 표가 `import.meta.env` 값을 보여 주는지 |
| `lessons.smoke.test.ts` | 목차의 모든 `Lesson`이 예외 없이 마운트되는지 |

어떤 테스트가 어떤 진도를 지키는지는 study10 화면의 `testMap`과 같습니다.
