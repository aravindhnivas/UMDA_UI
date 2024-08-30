interface LoggerStore {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    prefix?: '>' | '>>' | '$';
}
