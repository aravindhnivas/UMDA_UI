<script lang="ts">
    import Lockbutton from './Lockbutton.svelte';
    import { SlidersHorizontal } from 'lucide-svelte/icons';

    export let value: string | number | boolean = 'name';
    export let items: string[] | null = ['name', 'name2'];
    // export let value: string | number | boolean = true;
    // export let items: string[] | null = null;
    export let label: string = 'label';
    export let description: string = 'description';
    export let type: 'int' | 'float' = 'float';
    export let scale: 'log' | '' = 'log';
    export let lock: boolean = false;
    export let fine_tune: boolean = false;
    export let fine_tuned_values = '';

    let component: 'input' | 'select' | 'checkbox';
    onMount(() => {
        if (isArray(items) && items.length > 0) {
            fine_tuned_values ||= items.join(', ');
        } else if (isBoolean(value)) {
            component = 'checkbox';
            fine_tuned_values = 'true, false';
        } else if (isString(value) || isNumber(value)) {
            component = 'input';
        }
    });
</script>

<div class="grid grid-cols-5 join border border-rounded p-2" class:border-gray-600={lock}>
    <span class="flex items-end gap-2 mb-1 col-span-6">
        <Lockbutton class="join-item" bind:lock />
        <span class="text-sm {lock ? 'text-gray-600/75' : ''}">{label}</span>
    </span>
    {#if fine_tune}
        {#if component === 'checkbox'}
            <input
                class="input input-bordered input-sm join-item col-span-5"
                bind:value={fine_tuned_values}
                disabled={true}
            />
        {:else}
            <input
                class="input input-bordered input-sm join-item {component === 'input' ? 'col-span-3' : 'col-span-5'}"
                placeholder="min, max, step"
                bind:value={fine_tuned_values}
                disabled={lock}
            />
        {/if}
        {#if component === 'input'}
            {#if type === 'float'}
                <select class="select select-bordered select-sm join-item" bind:value={scale} disabled={lock}>
                    <option disabled selected>type</option>
                    <option>log</option>
                    <option></option>
                </select>
            {/if}
            <select
                class="select select-bordered select-sm join-item"
                class:col-span-2={type !== 'float'}
                bind:value={type}
                disabled={lock}
            >
                <option disabled selected>type</option>
                <option>int</option>
                <option>float</option>
            </select>
        {/if}
    {:else if isArray(items) && items?.length > 0}
        <select class="select select-bordered select-sm join-item col-span-5" bind:value disabled={lock}>
            <option disabled selected>Choose a value</option>
            {#each items as item (item)}
                <option>{item}</option>
            {/each}
        </select>
    {:else if isBoolean(value)}
        <div class="flex items-center gap-2 col-span-5">
            <input type="checkbox" bind:checked={value} class="checkbox" disabled={lock} />
            <span>{value}</span>
        </div>
    {:else if isString(value) || isNumber(value)}
        <input
            class="input input-bordered input-sm join-item col-span-5"
            placeholder="value"
            bind:value
            disabled={lock}
        />
    {/if}
    <button
        disabled={lock}
        class="flex gap-1 items-center btn btn-sm btn-square join-item"
        class:btn-info={fine_tune}
        on:click={() => {
            fine_tune = !fine_tune;
        }}
    >
        <SlidersHorizontal size="20" />
    </button>
    <span class="text-sm col-span-6 {lock ? 'text-gray-600/75' : ''}">{description}</span>
</div>
