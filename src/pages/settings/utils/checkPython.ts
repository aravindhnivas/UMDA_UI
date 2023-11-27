import { pyVersion, pyServerReady, umdapyVersion } from '$lib/pyserver/stores';
import computePy from '$lib/pyserver/computePy';
import { asset_download_required } from './stores';

export async function getPyVersion(e?: MouseEvent) {
    if (!get(pyServerReady)) {
        toast.error('start umdapy server first!');
        return Promise.reject('start umdapy server first!');
    }
    const dataFromPython = await computePy<{ python: string; umdapy: string }>({
        e,
        target: e?.currentTarget as HTMLButtonElement,
        pyfile: 'getVersion',
        args: [''],
    });

    if (!dataFromPython) {
        toast.error('Could not access pyfile');
        return Promise.reject('Could not access pyfile');
    }

    pyVersion.set(dataFromPython.python);
    umdapyVersion.set(dataFromPython.umdapy);

    if (get(umdapyVersion) < import.meta.env.VITE_PY_MIN_VERSION) {
        asset_download_required.set(true);
    }

    return Promise.resolve(dataFromPython);
}
