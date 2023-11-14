import '@unocss/reset/normalize.css';
import './scss/global.scss';
import 'virtual:uno.css';
// import '@unocss/reset/tailwind.css';
// import 'uno.css';
import App from './App.svelte';

const app = new App({
    target: document.getElementById('app') as HTMLDivElement,
});

export default app;
