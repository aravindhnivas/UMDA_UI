<script lang="ts">
    import { current_post_analysis_files_directory } from './plot-analysis/stores';
    import { AlertCircle, CheckCheck } from 'lucide-svelte/icons';

    export let name: string;
    export let recheck_files = false;
</script>

<div class="flex gap-2">
    <button class="btn btn-xs btn-outline" on:click={() => (recheck_files = !recheck_files)}>check file status</button>
    {#key recheck_files}
        {#await $current_post_analysis_files_directory then dir}
            {#await path.join(dir, name) then file}
                {#if file}
                    {#await fs.exists(file) then value}
                        {#if value}
                            <div class="badge badge-info gap-2">
                                <CheckCheck />
                                <span>File available: {name}</span>
                            </div>
                        {:else}
                            <div class="badge badge-error gap-2">
                                <AlertCircle size="20" />
                                <span>File not available: {name}</span>
                            </div>
                        {/if}
                    {/await}
                {/if}
            {/await}
        {/await}
    {/key}
</div>
