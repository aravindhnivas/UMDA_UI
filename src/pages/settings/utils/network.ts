import { serverInfo } from './stores';
import { toast } from 'svelte-sonner';

const fail = (err: string | Object) => {
    serverInfo.error('failed to check network status');
    if (typeof err === 'string') serverInfo.error(err);
    else serverInfo.error(JSON.stringify(err, null, 2));
    return false;
};

export const checkNetstat_execution = async (port: number) => {
    serverInfo.warn(`Checking network status for port: ${port}`);
    const args = {
        win32: ['-ano', '-p', 'tcp'],
        darwin: ['-i', `:${port}`],
        linux: ['-i', `:${port}`],
    };
    const currentplatform = (await platform()) as 'win32' | 'darwin' | 'linux';
    console.log({ args, currentplatform });
    serverInfo.prompt(`netstat-${currentplatform}: ${args[currentplatform].join(' ')}`);
    return new shell.Command(`netstat-${currentplatform}`, args[currentplatform]).execute();
};

export const checkNetstat = async (port: number) => {
    const [err, output] = await oO(checkNetstat_execution(port));
    if (!output) return console.error('no output');
    console.log(output?.stdout);

    if (output.stdout) {
        output.stdout.split('\n').forEach(ln => {
            serverInfo.warn(ln);
        });
    } else {
        serverInfo.error('No output from netstat');
    }

    if (err || output.stderr) return fail(err || output.stderr);

    const currentplatform = (await platform()) as 'win32' | 'darwin' | 'linux';
    if (currentplatform !== 'win32') return true;

    const cond = (ln: string) => {
        if (ln.includes('TCP') && ln.includes(`:${port}`)) {
            return ln;
        }
    };

    const filtered_output = output.stdout.trim().split('\n').map(cond).filter(Boolean);
    serverInfo.warn(filtered_output.join('\n'));
    serverInfo.warn('network status check done!');
    return true;
};

export const killPID = async (fullports: string[]) => {
    if (fullports.length < 1) return toast.error('No PIDs to kill!');

    serverInfo.warn('Closing unused PIDs: ' + fullports.join(', '));
    const kill = async (port: string) => {
        const args = {
            win32: ['/PID', port, '/F'],
            darwin: ['-9', port],
            linux: ['-9', port],
        };

        const currentplatform = (await platform()) as 'win32' | 'darwin' | 'linux';
        const command = currentplatform === 'win32' ? `taskkill-${await platform()}` : 'taskkill-darwin';
        const [_err, output] = await oO(new shell.Command(command, args[currentplatform]).execute());

        if (_err) {
            serverInfo.error(JSON.stringify(_err, null, 2));
            return;
        }
        fullports = fullports.filter(p => p !== port);

        if (!output) return;
        if (output.stderr) {
            return serverInfo.error(output.stdout);
        }
        serverInfo.success(output.stdout);
    };
    for (const port of fullports) {
        await kill(port);
    }

    if (fullports.length === 0) {
        serverInfo.success('All PIDs closed successfully');
    }
    return fullports;
};
