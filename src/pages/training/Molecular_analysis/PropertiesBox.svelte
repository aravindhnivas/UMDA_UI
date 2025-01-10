<script lang="ts">
    export let all_properties: string[] = [];
    export let selected_properties: string[] = [];
    export let full_analysis: Record<string, any> = {};
</script>

<div class="flex-gap flex-wrap items-baseline">
    {#each all_properties as prop (prop)}
        {#if selected_properties.includes(prop)}
            <div class="grid gap-2 border-l border-black p-2">
                <div class="text-xl font-bold">{prop}</div>
                <ul>
                    {#each Object.keys(full_analysis[prop]) as key (`${prop}-${key}`)}
                        <li>{key}: {full_analysis[prop][key]}</li>
                    {/each}
                </ul>
            </div>
        {/if}
    {/each}
</div>
