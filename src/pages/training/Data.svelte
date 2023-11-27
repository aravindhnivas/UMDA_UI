<script lang="ts">
    import computePy from '$lib/pyserver/computePy';
    import { dialog } from '@tauri-apps/api';

    export let id: string;
    export let display: string = 'none';

    const filetypes = ['csv', 'binary', 'hdf5', 'json'];

    let filename = '';
    let filetype = 'csv';
    let key = '';

    const load_data = async (e: MouseEvent) => {
        const dataFromPython = await computePy({
            e,
            pyfile: 'training.read_data',
            args: {
                filename,
                filetype,
                key,
            },
        });

        if (!dataFromPython) {
            toast.error('Could not access pyfile');
            return Promise.reject('Could not access pyfile');
        }

        console.warn(dataFromPython);
    };
</script>

<div class="h-full overflow-hidden grid content-start gap-1" {id} style:display>
    <div class="join">
        <select class="select select-sm select-bordered join-item" bind:value={filetype}>
            <option disabled selected>filetype</option>
            {#each filetypes as filetype}
                <option>{filetype}</option>
            {/each}
        </select>
        <button
            class="btn btn-sm join-item rounded-r-full"
            on:click={async () => {
                const result = await dialog.open();
                if (!result) return;
                if (typeof result === 'string') {
                    filename = result;
                } else {
                    filename = result[0];
                }
            }}>Browse file</button
        >
        <input class="input input-sm input-bordered join-item w-full" placeholder="filename" bind:value={filename} />
        {#if filename && filetype === 'hdf5'}
            <input class="input input-sm input-bordered join-item" placeholder="key" bind:value={key} />
        {/if}
        <button class="button join-item" on:click={load_data}>load</button>
    </div>
</div>
