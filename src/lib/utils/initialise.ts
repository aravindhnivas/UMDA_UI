export const currentVersion = writable('');
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const getID = () => Math.random().toString(32).substring(2);
