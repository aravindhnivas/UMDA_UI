<script lang="ts">
    import FileExists from '$lib/components/FileExists.svelte';
    import { current_pretrained_file, grid_search_method } from '../stores';
    const optuna_plots = [
        'contour',
        'hyperparameter_importance',
        'optimization_history',
        'parallel_coordinate',
        'slice_plot',
        'edf',
        'timeline',
    ];

    const get_optuna_fig_dir = async (name: Promise<string>) => {
        const pre_trained_file = await name;
        const pre_trained_dir = await path.dirname(pre_trained_file);
        const optuna_figures_dir = await path.join(pre_trained_dir, 'optuna_figures');
        return optuna_figures_dir;
    };
</script>

{#if $grid_search_method?.toLocaleLowerCase() === 'optuna'}
    <h3>Optuna - Grid search plots</h3>
    <div class="join">
        <FileExists name={get_optuna_fig_dir($current_pretrained_file)} let:resolved={optuna_figures_dir} let:dirname>
            {#each optuna_plots as plot_name}
                <FileExists name={path.join(optuna_figures_dir, `${plot_name}.html`)} let:resolved={html_file}>
                    <button
                        class="btn btn-sm btn-outline join-item"
                        on:click={async () => {
                            console.log('Opening', { html_file });
                            await shell.open(html_file);
                        }}>{plot_name}</button
                    >
                </FileExists>
            {/each}
        </FileExists>
    </div>
{/if}
