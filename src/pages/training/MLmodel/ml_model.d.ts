type MLModel = 'linear_regression' | 'ridge' | 'svr' | 'knn' | 'rfr' | 'gbr' | 'gpr' | 'xgboost' | 'catboost' | 'lgbm';
type MLParameterValue =
    | string
    | number
    | boolean
    | null
    | {
          default: string | number | boolean;
          options: Record<string, string | number>;
      };

// type ModelHyperParameters = Record<string, { value: MLParameterValue; description: string; type: string }>;
// type ModelParameters = Record<string, { value: MLParameterValue; description: string; type: string }>;

interface ModelParametersType {
    value: MLParameterValue;
    description: string;
    type: 'string' | 'integer' | 'float' | 'bool';
}

interface CurrentModel {
    name: string;
    description: string;
    hyperparameters: Record<string, ModelParametersType>;
    parameters: Record<string, ModelParametersType>;
}

type ParametersArgs = Record<string, Record<string, string | boolean | number | null>>;

type CV_scoring_methods = 'r2' | 'mse' | 'rmse' | 'mae';
interface CVScores {
    mean: number;
    std: number;
    scores: number[];
}

interface MLStats {
    r2: number;
    mse: number;
    rmse: number;
    mae: number;
}

type LearningCurveData = Record<string, Record<'test' | 'train', CVScores>>;
type CVScoresData = Record<'test' | 'train', Record<CV_scoring_methods, CVScores>>;

interface MLResults {
    learning_curve_plotly_data?: {
        data: Partial<Partial<PlotData>>[];
        layout: Partial<Partial<Layout>>;
    };
    embedding: Embedding;
    PCA: boolean;
    data_shapes: {
        X: number[];
        y: number[];
        X_test: number[];
        y_test: number[];
        X_train: number[];
        y_train: number[];
    };
    train_stats: MLStats;
    test_stats: MLStats;
    model: string;
    bootstrap: boolean;
    bootstrap_nsamples?: number;
    cross_validation: boolean;
    cv_fold?: number;
    cv_scores?: CVScoresData;
    timeframe: string;
    best_params?: Record<string, string | number | boolean | null>;
    best_score?: number;
    time: string;
}

type ParallelComputationBackend = 'loky' | 'threading' | 'multiprocessing' | 'dask';
// type ParallelComputationBackend = 'threading' | 'dask';

type MLParamsLockStatus = Record<
    MLModel,
    {
        parameters: Record<string, boolean>;
        hyperparameters: Record<string, boolean>;
    }
>;

type FineTunedValues = Record<
    MLModel,
    Record<
        'parameters' | 'hyperparameters',
        Record<
            string,
            {
                value: string;
                active: boolean;
                type: ModelParametersType['type'];
                scale: 'linear' | 'log' | null;
            }
        >
    >
>;

interface SavedParams {
    values: Record<string, string | number | boolean | null>;
    model: MLModel;
    timestamp: string;
    mode: 'fine_tuned' | 'normal';
    cv_fold?: number;
    grid_search_method?: string;
}
