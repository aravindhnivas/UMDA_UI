import { Terminal, type ITerminalInitOnlyOptions, type ITerminalOptions } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

export class LOGGER {
    term: Terminal;
    fitAddon = new FitAddon();
    constructor(node: HTMLElement, options?: ITerminalOptions & ITerminalInitOnlyOptions) {
        if (!node) throw new Error('No node provided!');
        options = {
            // cursorBlink: true,
            fontSize: 16,
            theme: {
                background: '#202B33',
            },
            ...(options || {}),
        };

        // const fitAddon = new FitAddon();
        this.term = new Terminal(options);
        this.term.loadAddon(this.fitAddon);
        this.term.open(node);
        this.fitAddon.fit();

        this.term.writeln('$ Terminal ready');
    }

    handle_logs(msg: string | Object) {
        if (typeof msg === 'string') {
            return msg;
        } else {
            return JSON.stringify(msg, null, 2);
        }
    }

    info(message: string) {
        this.term.writeln(`$ ${this.handle_logs(message)}`);
    }

    warn(message: string) {
        this.term.writeln(`\x1b[33m$ ${this.handle_logs(message)}\x1b[0m`);
    }

    error(message: string) {
        this.term.writeln(`\x1b[31m$ ${this.handle_logs(message)}\x1b[0m`);
    }

    success(message: string) {
        this.term.writeln(`\x1b[32m$ ${this.handle_logs(message)}\x1b[0m`);
    }
}
