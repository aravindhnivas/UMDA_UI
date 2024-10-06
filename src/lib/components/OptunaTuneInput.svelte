<script lang="ts">
    import Lockbutton from './Lockbutton.svelte';
    import { SlidersHorizontal } from 'lucide-svelte/icons';

    export let value: string | boolean = '1';
    // export let value: string | number | boolean = true;
    // export let items: string[] | null = ['1', '2', '3'];
    export let items: string[] | null = null;
    export let label: string = 'label';
    export let description: string = 'description';
    export let type: 'int' | 'float' = 'float';
    export let scale: 'log' | 'linear' = 'log';
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

<div class="grid grid-cols-5 join">
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
                on:change={() => {
                    if (!isString(fine_tuned_values)) return;
                    const arr = fine_tuned_values.split(',').map(v => v.trim());
                    console.log({ component, arr });
                    if (component === 'input') {
                        if (arr.length > 3) {
                            fine_tuned_values = arr.slice(0, 3).join(', ');
                            return toast.error('Max 3 values allowed for int/float type - min, max, step');
                        }
                        if (arr.length === 1) {
                            fine_tune = false;
                            value = arr[0];
                            return;
                        }
                    }
                }}
            />
        {/if}
        {#if component === 'input'}
            <select class="select select-bordered select-sm join-item" bind:value={scale} disabled={lock}>
                <option disabled selected>type</option>
                <option>log</option>
                <option>linear</option>
            </select>
            <select class="select select-bordered select-sm join-item" bind:value={type} disabled={lock}>
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
            on:change={() => {
                if (!isString(value)) return;
                const arr = value.split(',').map(v => v.trim());
                if (arr.length === 1) return;
                if (arr.length > 3) {
                    fine_tune = true;
                    fine_tuned_values = arr.slice(0, 3).join(', ');
                    return toast.error('Max 3 values allowed - min, max, step');
                }
                fine_tune = true;
                fine_tuned_values = arr.join(', ');
                return;
            }}
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
