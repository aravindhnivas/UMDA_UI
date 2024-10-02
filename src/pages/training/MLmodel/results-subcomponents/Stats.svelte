<script lang="ts">
    export let stats: MLStats;
    export let rcv: Record<CV_scoring_methods, CVScores> | undefined;
    export let cv_fold: number | undefined;
    export let significant_digits: number = 2;
    export let bg_color: 'warning' | 'info' = 'warning';
</script>

<div class="grid grid-cols-6 gap-2 items-center w-3xl">
    <span class="badge badge-{bg_color} col-span-2"><slot></slot> </span>
    <span class="badge badge-{bg_color}">{stats.r2.toFixed(significant_digits)}</span>
    <span class="badge badge-{bg_color}">{stats.mse.toFixed(significant_digits)}</span>
    <span class="badge badge-{bg_color}">{stats.rmse.toFixed(significant_digits)}</span>
    <span class="badge badge-{bg_color}">{stats.mae.toFixed(significant_digits)}</span>
</div>
{#if rcv}
    <div class="grid grid-cols-6 gap-2 items-center w-3xl">
        <span class="badge col-span-2">{cv_fold}-fold CV:</span>
        <span class="badge">{rcv.r2.mean.toFixed(significant_digits)} ({rcv.r2.std.toFixed(significant_digits)})</span>
        <span class="badge">{rcv.mse.mean.toFixed(significant_digits)} ({rcv.mse.std.toFixed(significant_digits)})</span
        >
        <span class="badge"
            >{rcv.rmse.mean.toFixed(significant_digits)} ({rcv.rmse.std.toFixed(significant_digits)})</span
        >
        <span class="badge">{rcv.mae.mean.toFixed(significant_digits)} ({rcv.mae.std.toFixed(significant_digits)})</span
        >
    </div>
{/if}
