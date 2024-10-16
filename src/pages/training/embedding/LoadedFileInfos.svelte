<script lang="ts">
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { embedd_savefile_path } from './stores';
    import { training_column_name_X, training_column_name_y } from '../training_file/stores';
    import { RefreshCcw } from 'lucide-svelte/icons';

    let refresh = false;

    const dispatch = createEventDispatcher();

    let items = [
        { name: 'Training file', key: 'training_file' },
        { name: 'Embedded vector file', key: 'embedded_file' },
        { name: 'Train X', key: 'columnX' },
        { name: 'Train y', key: 'columnY' },
    ];

    let metadata: { data_shape: number[]; invalid_smiles: number } | null = null;

    const refresh_data = async (tfile: Promise<string>, vfile: Promise<string>, columnX: string, columnY: string) => {
        metadata = null;
        let loaded_files: LoadedInfosFile = {
            training_file: { value: '', valid: false, basename: '' },
            embedded_file: { value: '', valid: false, basename: '' },
            columnX: { value: '', valid: false, basename: '' },
            columnY: { value: '', valid: false, basename: '' },
        };
        const [_training_file, _embedded_file] = await Promise.all([tfile, vfile]);

        const vector_metadata_file = _embedded_file.replace('.npy', '.metadata.json');
        const _metadata = await readJSON<{ data_shape: number[]; invalid_smiles: number }>(vector_metadata_file);
        if (_metadata) metadata = _metadata;

        loaded_files.training_file = {
            value: _training_file,
            valid: await fs.exists(_training_file),
            basename: await path.basename(_training_file),
        };
        loaded_files.embedded_file = {
            value: _embedded_file,
            valid: await fs.exists(_embedded_file),
            basename: await path.basename(_embedded_file),
        };
        loaded_files.columnX = { value: columnX, valid: columnX !== '', basename: columnX };
        loaded_files.columnY = { value: columnY, valid: columnY !== '', basename: columnY };
        dispatch('refresh', loaded_files);
        return loaded_files;
    };

    onMount(() => {
        refresh = !refresh;
    });
</script>

<button class="w-max btn btn-sm btn-outline" on:click={() => (refresh = !refresh)}>
    <span>Refresh</span>
    <RefreshCcw size="20" />
</button>

{#key refresh}
    {#await refresh_data($current_training_data_file, $embedd_savefile_path, $training_column_name_X, $training_column_name_y) then loaded_files}
        <div class="grid gap-2 grid-cols-4 items-center">
            {#each items as { name, key }}
                {@const { value, valid } = loaded_files[key]}
                <div>{name}:</div>
                <div class="col-span-3 border-rounded" class:bg-error={!valid}>
                    <code class="break-all text-sm p-1" class:bg-success={valid}>{value}</code>
                </div>
            {/each}
            {#if metadata?.data_shape || metadata?.invalid_smiles}
                <div class="divider col-span-4"></div>
                <div>Data shape (n_samples, n_features):</div>
                <div class="col-span-3 border-rounded">({metadata.data_shape?.join(', ')})</div>
                {#if metadata.invalid_smiles === 0}
                    <div class="col-span-4 badge">All SMILES are valid - encoded</div>
                {:else}
                    <div>Invalid SMILES embedding:</div>
                    <div class="col-span-3 border-rounded">{metadata.invalid_smiles}</div>
                    <div>Total valid SMILES embedding:</div>
                    <div>{metadata.data_shape[0] - metadata.invalid_smiles}</div>
                {/if}
            {/if}
        </div>
    {/await}
{/key}
