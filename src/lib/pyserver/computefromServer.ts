import { pyServerPORT, get } from './stores'
import { path, fs } from '@tauri-apps/api'
interface Type {
    pyfile: string
    args: Object
    target?: HTMLButtonElement | null
    general?: boolean
}

export default async function ({ pyfile, args, target, general }: Type): Promise<DataFromPython | string | undefined> {
    try {
        console.time('Computation took')

        if (!general) {
            target?.classList.add('is-loading')
            const filename = pyfile.split('.').at(-1) + '_data.json'
            const outputFile = await path.join(window.tempdirPath, filename)
            console.warn(await path.dirname(outputFile))
            if (await fs.exists(outputFile)) {
                const [_err] = await oO(fs.removeFile(outputFile))
                if (_err) console.error(_err)
            }
        }

        const URL = `http://localhost:${get(pyServerPORT)}/`

        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ pyfile, args: { ...args, general } }),
        })

        if (target?.classList.contains('is-loading')) {
            target.classList.remove('is-loading')
        }
        console.timeEnd('Computation took')

        console.warn(response)
        if (!response.ok) {
            const jsonErrorInfo = await response.json()
            console.log({ jsonErrorInfo })
            return Promise.reject(jsonErrorInfo?.error || jsonErrorInfo)
        }

        const dataFromPython = await response.json()
        if (!dataFromPython) return Promise.reject('could not get file from python. check the output json file')
        console.warn(dataFromPython)

        if (general) {
            const { done } = dataFromPython
            if (!done) Promise.reject(done)
            return Promise.resolve(<string>done)
        }

        return Promise.resolve(<DataFromPython>dataFromPython)
    } catch (error) {
        if (target?.classList.contains('is-loading')) {
            target.classList.remove('is-loading')
        }

        if (error instanceof Error) {
            const msg = error.message
            const details = error.stack || error
            console.error(error)
            return Promise.reject(new Error(`Error after receiving data from python \n${msg} \n${details}`))
        }
    }
}
