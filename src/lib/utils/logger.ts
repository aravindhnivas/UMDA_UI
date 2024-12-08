import * as console from '@tauri-apps/plugin-log';

class Logger {
    static error(message: string | Record<string, any>): void {
        console.error(JSON.stringify(message));
    }

    static warn(message: string | Record<string, any>): void {
        console.warn(JSON.stringify(message));
    }

    static info(message: string | Record<string, any>): void {
        console.info(JSON.stringify(message));
    }
}

export { Logger as logger };
