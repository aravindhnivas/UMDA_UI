interface DataType {
    columns: string[];
    head?: {
        [key: string]: string | number;
    }[];
    shape: number;
}

interface EmbeddingResult {
    name: string;
    shape: string;
    invalid_smiles: string[];
    saved_file: string;
    computed_time: string;
}
