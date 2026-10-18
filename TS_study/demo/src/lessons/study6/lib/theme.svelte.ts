import { getContext, setContext } from 'svelte'
import { persisted } from './persisted.svelte.js'

// context의 key. Symbol을 쓰면 다른 라이브러리의 key와 절대 겹치지 않는다.
const THEME_KEY = Symbol('study6-theme')

export type ThemeMode = 'light' | 'dark'

export interface ThemeContext {
  readonly mode: ThemeMode
  toggle(): void
}

// 반드시 "컴포넌트가 초기화되는 동안(<script> 최상위)" 호출해야 한다.
// 부모(Provider)에서 호출 → 그 아래 모든 자손이 useTheme()으로 꺼내 쓴다.
export function provideTheme(): ThemeContext {
  const theme = persisted<ThemeMode>('study6-theme', 'light')

  const api: ThemeContext = {
    get mode() {
      return theme.value
    },
    toggle() {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    },
  }
  setContext(THEME_KEY, api)
  return api
}

export function useTheme(): ThemeContext {
  const theme = getContext<ThemeContext | undefined>(THEME_KEY)
  if (!theme) throw new Error('useTheme()은 ThemeProvider 안에서만 사용할 수 있습니다.')
  return theme
}
