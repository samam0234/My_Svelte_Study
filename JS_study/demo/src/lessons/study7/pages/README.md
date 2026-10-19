# study7/pages

study7의 두 라우터가 같이 쓰는 페이지입니다. 라우터 구현은 [custom](../custom/README.md)과 [library](../library/README.md)에 있습니다.

- 저장소 전체: [README.md](../../../../../../README.md)
- 상위 폴더: [README.md](../README.md)
- study7 문서: [study7.md](../../../../../../study7.md)

## 목적

페이지를 라우터에서 분리해, 주소만 같으면 어느 라우터에서든 같은 화면이 나오게 합니다. 데이터는 [`../data.js`](../data.js)의 `users`입니다.

## 파일

| 파일 | 기능 |
|---|---|
| `Home.svelte` | 해시 `#/` 안내 |
| `Users.svelte` | 사용자 목록. 각 항목은 상세 주소로 이동 |
| `UserDetail.svelte` | `/users/:id`. id로 한 명을 찾고, 없으면 안내 |
| `Admin.svelte` | 로그인한 경우만 보이는 관리 페이지 |
| `Login.svelte` | 이름을 받아 `auth.login`. 가드에 막힌 뒤 들어오는 화면 |
| `NotFound.svelte` | 표에 없는 경로의 404 |
