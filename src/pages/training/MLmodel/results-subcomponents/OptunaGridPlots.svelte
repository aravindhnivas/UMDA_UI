<script lang="ts">
    import { current_pretrained_file } from '../stores';
    const optuna_plots = [
        'contour',
        'hyperparameter_importance',
        'optimization_history',
        'parallel_coordinate',
        'slice_plot',
        'edf',
        'timeline',
    ];

    const get_optuna_fig_dir = async () => {
        const pre_trained_file = await $current_pretrained_file;
        const pre_trained_dir = await path.dirname(pre_trained_file);
        const optuna_figures_dir = await path.join(pre_trained_dir, 'optuna_figures');
        return optuna_figures_dir;
    };
</script>

<h3>Optuna - Grid search plots</h3>
<div class="join">
    {#await get_optuna_fig_dir() then optuna_figures_dir}
        {#await fs.exists(optuna_figures_dir) then dir_exists}
            {#if dir_exists}
                {#each optuna_plots as plot_name}
                    {#await path.join(optuna_figures_dir, `${plot_name}.html`) then html_file}
                        {#await fs.exists(html_file) then html_file_exists}
                            {#if html_file_exists}
                                <button
                                    class="btn btn-sm btn-outline join-item"
                                    on:click={async () => {
                                        await shell.open(html_file);
                                    }}>{plot_name}</button
                                >
                            {/if}
                        {/await}
                    {/await}
                {/each}
            {/if}
        {/await}
    {/await}
</div>
