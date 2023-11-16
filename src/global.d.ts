interface Exposed {
    sleep: (ms: number) => Promise<void>;
    tempdirPath: string;
    currentPlatform: string;
    getID: () => string;
    error: unknown;
}

interface Window extends Exposed {}

interface OutputBoxtype {
    value: string;
    type: 'info' | 'error' | 'warning' | 'success';
}
