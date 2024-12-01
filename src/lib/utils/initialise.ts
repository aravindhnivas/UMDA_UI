export const currentVersion = writable('');
export const sleep = (ms: number) =>
    new Promise<void>(resolve =>
        setTimeout(async () => {
            await tick();
            resolve();
            console.warn('slept', ms);
            return;
        }, ms),
    );
// export const getID = () => Math.random().toString(32).substring(2);
export const getID = (length = 8) =>
    Math.random()
        .toString(32)
        .substring(2, length + 2);
export const footerMsg = writable<{ status: 'idle' | 'running' | 'done'; msg: string }>({ status: 'idle', msg: '' });
