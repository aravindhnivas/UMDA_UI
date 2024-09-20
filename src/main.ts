import './scss';
import App from './App.svelte';
import './lib/utils/initialise';

const app = new App({
    target: document.getElementById('app') as HTMLDivElement,
});

export default app;
