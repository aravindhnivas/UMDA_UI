type ParamValue = string | number | boolean | null | { [key: string]: string };

interface CurrentModel {
    name: string;
    description: string;
    hyperparameters: Record<string, { value: ParamValue; description: string; fine_tune: string; type: string }>;
    parameters: Record<string, { value: ParamValue; description: string; type: string }>;
}

interface Results {
    embedding: Embedding;
    PCA: boolean;
    data_size: number;
    r2: number;
    mse: number;
    rmse: number;
    mae: number;
    model: string;
    bootstrap: boolean;
    bootstrap_nsamples?: number;
    cross_validation: boolean;
    cv_fold?: number;
    cv_scores?: {
        mean: string;
        std: string;
        scores: number[];
    };
    timeframe: string;
    best_params?: Record<string, string | number | boolean | null>;
    best_score?: number;
    time: string;
}
