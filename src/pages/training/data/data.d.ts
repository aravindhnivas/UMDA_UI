interface DataType {
    columns: string[];
    head?: {
        [key: string]: string | number;
    }[];
    shape: number;
}