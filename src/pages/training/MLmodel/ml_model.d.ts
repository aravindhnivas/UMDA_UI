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

type ModelHyperParameters = Record<string, { value: MLParameterValue; description: string; type: string }>;
type ModelParameters = Record<string, { value: MLParameterValue; description: string; type: string }>;

interface CurrentModel {
    name: string;
    description: string;
    hyperparameters: ModelHyperParameters;
    parameters: ModelParameters;
}

type ParametersArgs = Record<string, Record<string, string | boolean | number | null>>;

type CV_scoring_methods = 'r2' | 'mse' | 'rmse' | 'mae';
interface CV_scores {
    mean: number;
    std: number;
    scores: number[];
}

type LearningCurveData = Record<string, Record<'test' | 'train', { mean: string; std: string; scores: number[] }>>;

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
    train_stats: {
        r2: number;
        mse: number;
        rmse: number;
        mae: number;
    };
    test_stats: {
        r2: number;
        mse: number;
        rmse: number;
        mae: number;
    };
    model: string;
    bootstrap: boolean;
    bootstrap_nsamples?: number;
    cross_validation: boolean;
    cv_fold?: number;
    cv_scores?: {
        test: Record<CV_scoring_methods, CV_scores>;
        train: Record<CV_scoring_methods, CV_scores>;
    };
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
    {
        parameters: Record<string, string>;
        hyperparameters: Record<string, string>;
    }
>;
