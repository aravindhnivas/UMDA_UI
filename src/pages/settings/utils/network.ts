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

    const platformName = (await platform()) as 'windows' | 'macos' | 'linux';
    const args = {
        windows: ['-ano', '-p', 'tcp'],
        macos: ['-i', `:${port}`],
        linux: ['-i', `:${port}`],
    };
    console.log({ args, platformName });
    serverInfo.prompt(`netstat-${platformName}: ${args[platformName].join(' ')}`);
    return shell.Command.create(`netstat-${platformName}`, args[platformName]).execute();
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

    const platformName = (await platform()) as 'windows' | 'macos' | 'linux';
    if (platformName !== 'windows') return true;

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
    const platformName = await platform();
    console.log({ platformName });
    serverInfo.warn('Closing unused PIDs: ' + fullports.join(', '));
    const kill = async (port: string) => {
        const args = {
            windows: ['/PID', port, '/F'],
            macos: ['-9', port],
            linux: ['-9', port],
        };

        const currentplatform = platformName as 'windows' | 'macos' | 'linux';

        const command = currentplatform === 'windows' ? `taskkill-${platformName}` : 'taskkill-macos';
        const [_err, output] = await oO(shell.Command.create(command, args[currentplatform]).execute());
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
