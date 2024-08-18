type AnalysisItemsType = 'size_distribution' | 'structural_distribution' | 'elemental_distribution';
type MolecularAnalysisFunction = (mode: string) => Promise<{ pyfile: string; args: Record<string, any> }>;
