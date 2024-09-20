<script lang="ts">
    import CustomInput from './CustomInput.svelte';

    export let label: string = '';
    export let value: string;
    export let items: string[] | Record<string, string[]> = [];
    export let helper: string = '';
    export let helperHighlight: string = '';
    export let disabled = false;
    export let use_input = false;

    let className = '';
    export { className as class };

    onMount(() => {
        if (use_input) return;

        if (value && isArray(items) && items.length === 0) {
            items = [value];
        }
    });

    const toggle_select = (e: MouseEvent) => {
        e.stopPropagation();
        if (e.altKey && e.shiftKey) {
            use_input = !use_input;
        }
    };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={toggle_select}>
    {#if use_input}
        <CustomInput bind:value label={`Enter ${label}`} placeholder={`Enter ${label}`} />
    {:else}
        <div class="flex flex-col gap-1 {className}">
            <span class="text-xs pl-1">{label}</span>
            <select class="select select-sm select-bordered" bind:value on:change {disabled}>
                {#if isArray(items) && items.length > 0}
                    <option disabled selected>{label}</option>
                    {#each items as item}
                        <option>{item}</option>
                    {/each}
                {:else if isObject(items)}
                    {#each Object.keys(items) as key}
                        {@const nested_items = items[key]}
                        <option disabled selected>{key}</option>
                        {#each nested_items as item}
                            <option>{item}</option>
                        {/each}
                    {/each}
                {/if}
            </select>
            {#if helper}
                <span class="text-xs pl-1">
                    {helper}
                    {#if helperHighlight}
                        <div class="badge badge-sm badge-neutral">
                            {helperHighlight}
                        </div>
                    {/if}
                </span>
            {/if}
        </div>
    {/if}
</div>
