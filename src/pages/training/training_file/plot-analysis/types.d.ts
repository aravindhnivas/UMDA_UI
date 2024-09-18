type AnalysisItemsType =
    | 'y-data_distribution'
    | 'size_distribution'
    | 'structural_distribution'
    | 'elemental_distribution';
type MolecularAnalysisFunction = (mode: string) => Promise<{ pyfile: string; args: Record<string, any> }>;

type YDistributionPlotNames = 'histogram' | 'kde' | 'box_plot' | 'qq_plot';
// interface YDistributionPlotData {
//     histogram: Partial<Plotly.PlotData>[];
//     kde: Partial<Plotly.PlotData>[];
//     box_plot: Partial<Plotly.PlotData>[];
//     qq_plot: Partial<Plotly.PlotData>[];
// }
type YDistributionPlotData = Record<YDistributionPlotNames, Partial<Plotly.PlotData>[]>;
