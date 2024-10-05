<script lang="ts">
    export let stats: MLStats;
    export let rcv: Record<CV_scoring_methods, CVScores> | undefined;
    export let cv_fold: number | undefined;
    export let significant_digits: number = 2;
    export let bg_color: 'warning' | 'info' = 'warning';

    const metrics = ['r2', 'mse', 'rmse', 'mae'] as const;

    function validate_stat(stat: string | number, significant_digits: number): string {
        if (isNumber(stat)) {
            if (isNaN(stat)) return '-';
            return stat.toFixed(significant_digits);
        }

        if (!isString(stat)) {
            toast.error('Invalid stat type');
            return '-';
        }

        const num = Number(stat);
        if (isNaN(num)) {
            return '-';
        }
        return num.toFixed(significant_digits);
    }
</script>

<div class="grid grid-cols-6 gap-2 items-center w-3xl">
    <span class="badge badge-{bg_color} col-span-2"><slot /></span>
    {#each metrics as metric}
        {#if stats[metric]}
            <span class="badge badge-{bg_color}">{validate_stat(stats[metric], significant_digits)}</span>
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
                {@const mean = validate_stat(rcv[metric].mean, significant_digits)}
                {@const std = validate_stat(rcv[metric].std, significant_digits)}
                {#if mean && std}
                    <span class="badge">{mean} ({std})</span>
                {/if}
            {:else}
                <span class="badge badge-error">-</span>
            {/if}
        {/each}
    </div>
{/if}
