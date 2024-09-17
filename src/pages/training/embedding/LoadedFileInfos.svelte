<script lang="ts">
    import { training_file } from '../training_file/stores';
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { embedd_savefile_path } from './stores';
    import { training_column_name_X, training_column_name_y } from '../training_file/stores';
    import { RefreshCcw, ArrowBigRight } from 'lucide-svelte/icons';

    export let show_status = true;
    export let show_embedded_file = true;

    const dispatch = createEventDispatcher();
    // let refresh = true;

    let loaded_files = {
        training_file: '',
        embedded_file: '',
        columnX: '',
        columnY: '',
    } as Record<string, string>;

    let items = [
        { name: 'Training file', key: 'training_file' },
        { name: 'Embedded vector file', key: 'embedded_file' },
        { name: 'Train X', key: 'columnX' },
        { name: 'Train y', key: 'columnY' },
    ];

    const refresh_data = async () => {
        let file_name: string;

        file_name = await $current_training_data_file;
        if (await fs.exists(file_name)) {
            loaded_files.training_file = file_name;
        } else {
            loaded_files.training_file = '';
        }

        file_name = await $embedd_savefile_path;
        if (await fs.exists(file_name)) {
            loaded_files.embedded_file = file_name;
        } else {
            loaded_files.embedded_file = '';
        }

        loaded_files.columnX = $training_column_name_X || '';
        loaded_files.columnY = $training_column_name_y || '';
        items = [...items]; // force update
        // refresh = !refresh;
        console.log('Loaded files:', loaded_files);
        dispatch('refresh', loaded_files);
    };

    onMount(refresh_data);
    $: if ($training_file.filename) refresh_data();
</script>

<div class="flex items-center justify-between">
    {#if show_status}
        <div class="flex gap-1 items-end">
            <code>File status indicator</code>
            <ArrowBigRight size="20" />
            <code class="badge badge-success">EXISTS</code>
            <code class="badge badge-error">DOESN'T-EXISTS</code>
        </div>
    {/if}
    <button class="flex btn btn-sm mb-2" on:click={refresh_data}>
        <span>Refresh</span>
        <RefreshCcw size="20" />
    </button>
</div>

<div class="grid gap-2 grid-cols-4 items-center">
    {#each items as { name, key }}
        {@const val = loaded_files[key]}
        <div>{name}:</div>
        <div class="col-span-3 border-rounded" class:bg-red={!val}>
            <code class=" break-all text-sm p-1" class:bg-success={val}>{val || `Invalid ${key} name`}</code>
        </div>
    {/each}
</div>
