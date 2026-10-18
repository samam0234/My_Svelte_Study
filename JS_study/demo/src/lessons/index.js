// 진도(lesson) 목록. 새 study를 추가할 때마다 한 줄씩 늘어난다.
import Study1 from './study1/Lesson.svelte'
import Study2 from './study2/Lesson.svelte'
import Study3 from './study3/Lesson.svelte'
import Study4 from './study4/Lesson.svelte'
import Study5 from './study5/Lesson.svelte'
import Study6 from './study6/Lesson.svelte'
import Study7 from './study7/Lesson.svelte'
import Study8 from './study8/Lesson.svelte'
import Study9 from './study9/Lesson.svelte'

export const lessons = [
  { id: 'study1', title: 'study1 · 첫 컴포넌트와 템플릿', component: Study1 },
  { id: 'study2', title: 'study2 · 반응형 $state/$derived/$effect', component: Study2 },
  { id: 'study3', title: 'study3 · props · 이벤트 · bind', component: Study3 },
  { id: 'study4', title: 'study4 · 조건 렌더링 · 리스트', component: Study4 },
  { id: 'study5', title: 'study5 · 컴포넌트 합성 · snippet', component: Study5 },
  { id: 'study6', title: 'study6 · 고급1 · 공유 상태', component: Study6 },
  { id: 'study7', title: 'study7 · 고급2 · 라우팅', component: Study7 },
  { id: 'study8', title: 'study8 · 고급3 · 폼 + API 연동', component: Study8 },
  { id: 'study9', title: 'study9 · 고급4 · transition · action · 생명주기', component: Study9 },
]
