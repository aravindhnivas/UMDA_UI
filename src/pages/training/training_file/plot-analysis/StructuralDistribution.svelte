<script lang="ts">
    import { post_analysis_files } from './stores';
    import Plot from 'svelte-plotly.js';
</script>

<Plot
    data={[]}
    layout={{
        xaxis: { title: 'True value' },
        yaxis: { title: 'Predicted value' },
        margin: { t: 0 },
    }}
    fillParent={true}
    debounce={250}
/>
