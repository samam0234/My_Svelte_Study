/// <reference types="vite/client" />

// .env 에 적는 사용자 변수의 타입을 선언한다. 선언해 두면 import.meta.env.VITE_APP_TITLE 에서 자동완성과 오타 검사가 된다.
interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
