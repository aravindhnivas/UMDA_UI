interface UMAPParams {
    n_neighbors: number;
    min_dist: number;
    n_components: number;
    n_jobs: number;
    metric: string;
    random_state: number;
}

interface UMAP_DBSCAN_Cluster_PARAMS {
    n_neighbors: number;
    min_dist: number;
    n_components: number;
    n_jobs: number;
    umap_metric: string;
    random_state: number;
    scale_embedding: boolean;
    use_cleaned_data: boolean;
    annotate_clusters: boolean;
    dbscan_eps: number;
    dbscan_min_samples: number;
    random_state_locked: boolean;
    fig_title: string;
}
