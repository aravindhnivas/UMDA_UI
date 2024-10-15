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

interface EmbeddingState {
    test_mode?: { embedded_vector: number[] };
    file_mode?: {
        name: string;
        shape: number;
        invalid_smiles: string[];
        saved_file: string;
        computed_time: string;
    };
    computed_time: string;
}
