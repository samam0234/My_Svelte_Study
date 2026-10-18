// 진도(lesson) 목록. 새 study를 추가할 때마다 한 줄씩 늘어난다.
import type { Component } from 'svelte'
import Study1 from './study1/Lesson.svelte'
import Study2 from './study2/Lesson.svelte'
import Study3 from './study3/Lesson.svelte'

export interface Lesson {
  id: string
  title: string
  component: Component
}

export const lessons: Lesson[] = [
  { id: 'study1', title: 'study1 · 첫 컴포넌트와 템플릿', component: Study1 },
  { id: 'study2', title: 'study2 · 반응형 $state/$derived/$effect', component: Study2 },
  { id: 'study3', title: 'study3 · props · 이벤트 · bind', component: Study3 },
]
