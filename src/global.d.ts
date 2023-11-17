interface Exposed {
    sleep: (ms: number) => Promise<void>;
    getID: () => string;
}

interface Window extends Exposed {}

interface OutputBoxtype {
    value: string;
    type: 'info' | 'error' | 'warning' | 'success';
}
