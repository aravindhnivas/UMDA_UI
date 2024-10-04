<script lang="ts">
    export let stats: MLStats;
    export let rcv: Record<CV_scoring_methods, CVScores> | undefined;
    export let cv_fold: number | undefined;
    export let significant_digits: number = 2;
    export let bg_color: 'warning' | 'info' = 'warning';

    const metrics = ['r2', 'mse', 'rmse', 'mae'] as const;
</script>

<div class="grid grid-cols-6 gap-2 items-center w-3xl">
    <span class="badge badge-{bg_color} col-span-2"><slot /></span>
    {#each metrics as metric}
        {#if stats[metric]}
            <span class="badge badge-{bg_color}">{stats[metric].toFixed(significant_digits)}</span>
        {:else}
            <span class="badge badge-error">-</span>
        {/if}
    {/each}
</div>
{#if rcv}
    <div class="grid grid-cols-6 gap-2 items-center w-3xl">
        <span class="badge col-span-2">{cv_fold}-fold CV:</span>
        {#each metrics as metric}
            {#if rcv[metric]}
                {@const mean = rcv[metric].mean.toFixed(significant_digits)}
                {@const std = rcv[metric].std.toFixed(significant_digits)}
                {#if mean && std}
                    <span class="badge">{mean} ({std})</span>
                {/if}
            {:else}
                <span class="badge badge-error">-</span>
            {/if}
        {/each}
    </div>
{/if}
