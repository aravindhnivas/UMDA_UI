<script lang="ts">
    import { current_training_data_file } from '../training_file/plot-analysis/stores';
    import { embedd_savefile_path } from './stores';
    import { training_column_name_X, training_column_name_y } from '../training_file/stores';

    const dispatch = createEventDispatcher();

    let items = [
        { name: 'Training file', key: 'training_file' },
        { name: 'Embedded vector file', key: 'embedded_file' },
        { name: 'Train X', key: 'columnX' },
        { name: 'Train y', key: 'columnY' },
    ];

    const refresh_data = async (
        tfile: Promise<string>,
        vfile: Promise<string>,
        columnX: string,
        columnY: string,
    ): Promise<Record<string, string>> => {
        let loaded_files: Record<string, string> = {
            training_file: '',
            embedded_file: '',
            columnX: '',
            columnY: '',
        };
        const [_training_file, _embedded_file] = await Promise.all([tfile, vfile]);

        if (await fs.exists(_training_file)) {
            loaded_files.training_file = _training_file;
        }

        if (await fs.exists(_embedded_file)) {
            loaded_files.embedded_file = _embedded_file;
        }

        loaded_files.columnX = columnX || '';
        loaded_files.columnY = columnY || '';
        dispatch('refresh', loaded_files);
        return loaded_files;
    };
</script>

{#await refresh_data($current_training_data_file, $embedd_savefile_path, $training_column_name_X, $training_column_name_y) then loaded_files}
    <div class="grid gap-2 grid-cols-4 items-center">
        {#each items as { name, key }}
            {@const val = loaded_files[key]}
            <div>{name}:</div>
            <div class="col-span-3 border-rounded" class:bg-red={!val}>
                <code class=" break-all text-sm p-1" class:bg-success={val}>{val || `Invalid ${key} name`}</code>
            </div>
        {/each}
    </div>
{/await}
