import { getVersion } from '@tauri-apps/api/app';
import { tempdir, platform } from '@tauri-apps/api/os';
// import bulmaQuickview from 'bulma-extensions/bulma-quickview/dist/js/bulma-quickview';

export const currentVersion = writable('');

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initApplication = async () => {
    try {
        currentVersion.set(await getVersion());
        // bulmaQuickview.attach();

        window.tempdirPath = await path.join(await tempdir(), import.meta.env.VITE_APP_ID);
        window.currentPlatform = await platform();
        if (!(await fs.exists(window.tempdirPath))) {
            await fs.createDir(window.tempdirPath);
        }
        console.warn('DOM fully loaded and parsed');
        // LOGGER.info('DOM fully loaded and parsed');
    } catch (err) {
        console.error(err);
    }
};
// window.addEventListener('DOMContentLoaded', initApplication);

// Alternative to DOMContentLoaded event
document.onreadystatechange = () => {
    // loading => document is loading
    // interactive => DOM is ready but not scripts and css
    // complete => page is ready fully
    if (document.readyState === 'interactive') {
        initApplication();
    }
};

// (async () => {
//     try {
//         currentVersion.set(await getVersion());
//         // bulmaQuickview.attach();
//         window.tempdirPath = await path.join(await tempdir(), import.meta.env.VITE_APP_ID);
//         window.currentPlatform = await platform();
//         // if (!(await fs.exists(window.tempdirPath))) {
//         //     await fs.createDir(window.tempdirPath);
//         // }
//         console.warn('DOM fully loaded and parsed');
//         // LOGGER.info('DOM fully loaded and parsed');
//     } catch (err) {
//         console.error(err);
//     }
// })();

export const getID = () => Math.random().toString(32).substring(2);
