interface DataType {
    columns: string[];
    head: {
        [key: string]: string | number;
    }[];
    shape: number;
    index_name: string;
}

interface EmbeddingResult {
    name: string;
    shape: string;
    invalid_smiles: string[];
    saved_file: string;
    computed_time: string;
}

type Embedding = 'mol2vec' | 'VICGAE';

type LoadedInfosFile = Record<string, { value: string; valid: boolean; basename: string }>;
