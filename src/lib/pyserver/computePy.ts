import computefromServer from './computefromServer'
import computefromSubprocess from './computefromSubprocess'
import { start_and_check_felionpy_with_toast } from './felionpyServer'
import { pyServerReady, get, developerMode, pyProgram } from './stores'
// import { startServer } from './felionpyServer'
// import { confirm } from '@tauri-apps/api/dialog'
// import { python_asset_ready } from '$src/Pages/settings/utils/stores'
interface Type {
    pyfile: string
    args: Object
    target?: HTMLButtonElement | null
    general?: boolean
    e?: Event
}

export default async function <T>({ e, target, pyfile, args, general }: Type) {
    target ||= e?.target as HTMLButtonElement
    let dataFromPython: T
    let processDivGeneral
    let processDivGeneralNum = 0

    try {
        // if (!get(python_asset_ready)) {
        //     dialog.message('python assets are missing. Download it in Settings -> Update', {
        //         title: 'Missing assets',
        //         type: 'error',
        //     })
        //     return window.handleError('python assets are missing')
        // }

        console.log(`Running python in ${general ? 'subprocess' : 'server'} mode`)
        console.warn(`Running python in ${get(developerMode) ? 'developer' : 'production'} mode \n ${get(pyProgram)}`)

        console.warn({ pyfile, args, general })
        if (general) {
            if (target) {
                processDivGeneral = target.getElementsByClassName('tag')?.[0]
                console.log(processDivGeneral)
                if (processDivGeneral) {
                    const num = processDivGeneral.textContent as string
                    processDivGeneralNum = isNaN(parseInt(num)) ? 0 : parseInt(num)
                    processDivGeneral.textContent = `${processDivGeneralNum + 1}`
                }
            }
            dataFromPython = await computefromSubprocess({
                target,
                general,
                pyfile,
                args,
            })
        } else {
            if (!get(pyServerReady)) {
                const result = await dialog.ask('Start the server ?', {
                    type: 'error',
                    title: 'felionpy server not running',
                })
                console.log(result)
                if (!result) return

                await start_and_check_felionpy_with_toast()
            }
            dataFromPython = await computefromServer({
                target,
                general,
                pyfile,
                args,
            })
        }

        return Promise.resolve(dataFromPython)
    } catch (error) {
        window.handleError(error)
    } finally {
        if (processDivGeneral) {
            const num = processDivGeneral.textContent as string
            processDivGeneralNum = isNaN(parseInt(num)) ? 0 : parseInt(num)
            const currentNum = processDivGeneralNum - 1

            if (currentNum > 0) {
                processDivGeneral.textContent = `${currentNum}`
            } else {
                processDivGeneral.textContent = ''
            }
        }
        console.log('COMPLETED')
    }
}
