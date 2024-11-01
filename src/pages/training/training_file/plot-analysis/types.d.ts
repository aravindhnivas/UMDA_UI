type AnalysisItemsType =
    | 'y-data_distribution'
    | 'size_distribution'
    | 'structural_distribution'
    | 'elemental_distribution';
type MolecularAnalysisFunction = (
    mode: string,
    force?: boolean,
) => Promise<{ pyfile: string; args: Record<string, any> }>;
type ApplyFilterForMolecularAnalysisFunction = (
    filtered_filename: string,
) => Promise<{ pyfile: string; args: Record<string, any> }>;
type YDistributionPlotNames = 'histogram' | 'kde' | 'box_plot' | 'qq_plot';
type YDistributionPlotData = Record<YDistributionPlotNames, Partial<Plotly.PlotData>[]>;

interface YDistributionStats {
    descriptive_statistics: {
        count: number;
        mean: number;
        std: number;
        min: number;
        max: number;
        '25%': number;
        '50%': number;
        '75%': number;
    };
    histogram: {
        counts: number[];
        bin_edges: number[];
        bin_size: number;
    };
    box_plot: {
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
    };
    qq_plot: {
        theoretical_quantiles: number[];
        sample_quantiles: number[];
    };
    skewness: number;
    kurtosis: number;
    anderson_darling_test: {
        statistic: number;
        critical_values: number[];
        significance_levels?: number[];
    };
    kde: {
        x: number[];
        y: number[];
    };
    applied_transformation?: string;
    boxcox_lambda?: number;
}
