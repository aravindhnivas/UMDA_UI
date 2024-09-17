<script lang="ts">
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { isObject, isEmpty } from 'lodash-es';
    import LoadedFileInfos from '../embedding/LoadedFileInfos.svelte';
    import { typeSafeObjectKeys } from '$lib/utils';

    let loaded_files = {} as LoadedInfosFile;
    const get_loaded_files = async (e: CustomEvent) => {
        if (!e.detail) return;
        loaded_files = e.detail;
    };
</script>

<CustomPanel open={false}>
    <svelte:fragment slot="title" let:open>
        <div class="flex-center">
            <span>Loaded training file</span>
            {#if !open}
                {#if isObject(loaded_files) && !isEmpty(loaded_files)}
                    {#each typeSafeObjectKeys(loaded_files) as key}
                        {@const { valid, basename } = loaded_files[key]}
                        <span class="badge badge-info" class:badge-error={!valid}>{basename}</span>
                    {/each}
                {/if}
            {/if}
        </div>
    </svelte:fragment>
    <LoadedFileInfos on:refresh={get_loaded_files} />
</CustomPanel>
