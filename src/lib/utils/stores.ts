import { type Writable, writable } from 'svelte/store';

export const active_tab: Writable<string> = writable('Tab 1');
