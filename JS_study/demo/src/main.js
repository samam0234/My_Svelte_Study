import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Svelte 5: new App() 대신 mount()로 컴포넌트를 DOM에 붙인다.
const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
