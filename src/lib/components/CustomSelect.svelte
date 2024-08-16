<script lang="ts">
    export let label: string = '';
    export let value: string;
    export let items: string[] = [];
    export let helper: string = '';
    export let disabled = false;
    export let use_input = false;
    let className = '';
    export { className as class };

    onMount(() => {
        if (use_input) return;

        if (value && items.length === 0) {
            items = [value];
        }
    });
</script>

{#if use_input}
    <div class="flex flex-col gap-1">
        <span class="text-xs pl-1">Enter {label}</span>
        <input type="text" class="input input-sm" bind:value placeholder="Enter {label}" />
    </div>
{:else}
    <div class="flex flex-col gap-1 {className}">
        <span class="text-xs pl-1">{label}</span>
        <select class="select select-sm select-bordered" bind:value on:change {disabled}>
            {#each items as item}
                <option>{item}</option>
            {/each}
        </select>
        {#if helper}
            <span class="text-xs pl-1 m-auto">{helper}</span>
        {/if}
    </div>
{/if}
