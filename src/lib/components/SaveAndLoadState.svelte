<script lang="ts">
    import { Download, Save, RotateCcw, RefreshCcw } from 'lucide-svelte/icons';
    import CustomSelect from './CustomSelect.svelte';

    export let params: Record<string, any>;
    export let default_params: Record<string, any>;
    export let loc: string;
    export let unique_ext: string = '.json';

    let filename: string = 'default';
    let items: string[] = [];

    const get_all_items_in_loc = async () => {
        const files = await fs.readDir(loc);
        items = files.filter(f => f.isFile && f.name.endsWith(unique_ext)).map(f => f.name.replace(unique_ext, ''));
        toast.success('Items loaded');
    };
</script>

<div class="flex-gap items-end">
    <CustomSelect label="filename" bind:value={filename} {items} enable_use_input>
        <svelte:fragment slot="pre-within">
            <button
                class="btn btn-sm btn-square btn-outline join-item"
                on:click={async () => await get_all_items_in_loc()}
            >
                <RefreshCcw size="18" />
            </button>
        </svelte:fragment>
    </CustomSelect>
    <button class="btn btn-sm btn-outline" on:click={() => (params = structuredClone(default_params))}>
        <RotateCcw />
        <span>Reset</span>
    </button>
    <button
        class="btn btn-sm btn-outline"
        on:click={async () => {
            const file = await path.join(loc, `${filename}${unique_ext}`);
            const contents = await readJSON(file);
            if (!contents) {
                toast.error('No state found');
                return;
            }
            params = contents;
            toast.success('State loaded');
        }}
    >
        <Download />
        <span>Load</span>
    </button>
    <button
        class="btn btn-sm btn-outline"
        on:click={async () => {
            const file = await path.join(loc, `${filename}${unique_ext}`);
            await writeJSON(file, params);
        }}
    >
        <Save />
        <span>Save</span>
    </button>
</div>
