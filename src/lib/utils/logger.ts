import * as tauri_logger from '@tauri-apps/plugin-log';

class Logger {
    static error(message: string | Record<string, any>): void {
        tauri_logger.error(JSON.stringify(message, null, 2));
    }

    static warn(message: string | Record<string, any>): void {
        tauri_logger.warn(JSON.stringify(message, null, 2));
    }

    static info(message: string | Record<string, any>): void {
        tauri_logger.info(JSON.stringify(message, null, 2));
    }

    static log(message: string | Record<string, any>): void {
        tauri_logger.info(JSON.stringify(message, null, 2));
    }
}

export { Logger as logger };
