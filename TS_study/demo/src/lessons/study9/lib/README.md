# study9/lib

액션과 생명주기 로그입니다.

- 저장소 전체: [README.md](../../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study9 문서: [study9.md](../../../../../../study9.md)

## 목적

DOM 노드에 붙였다 떼는 로직을 컴포넌트 밖으로 재사용할 수 있게 합니다. 액션은 노드가 생길 때 설정하고, 인자가 바뀌면 `update`, 노드가 사라지면 `destroy`로 리스너를 걷어 냅니다.

## 파일

| 파일 | 기능 |
|---|---|
| `actions.ts` | `clickOutside`, `clickOutsideAttach`, `autofocus`, `longpress` |
| `lifelog.svelte.ts` | 여러 컴포넌트가 같이 보는 로그 배열. `log`, `clearLogs` |
