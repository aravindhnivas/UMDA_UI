<script lang="ts">
    import Lockbutton from './Lockbutton.svelte';
    import { SlidersHorizontal, TriangleAlert } from 'lucide-svelte/icons';

    export let value: string | number | boolean | null = null;
    export let items: string[] | null = null;
    export let label: string = 'label';
    export let helper: string = 'description';
    export let helperHighlight: string = 'Default: ...';
    export let type: ModelParametersType['type'] = 'integer';
    export let scale: 'log' | 'linear' | null = null;
    export let lock: boolean = false;
    export let fine_tune: boolean = false;
    export let fine_tuned_values = '';

    const dispatch = createEventDispatcher();

    let component: 'input' | 'select' | 'checkbox';
    onMount(() => {
        if (isArray(fine_tuned_values)) {
            fine_tuned_values = fine_tuned_values.join(', ');
        }

        if (isArray(items) && items.length > 0 && value) {
            fine_tuned_values ||= items.join(', ');
            component = 'select';
        } else if (isBoolean(value)) {
            component = 'checkbox';
            fine_tuned_values = 'true, false';
        } else if (isString(value) || isNumber(value)) {
            if (isNumber(value)) {
                value = value.toString();
            }
            component = 'input';
        } else {
            component = 'input';
            value = 'null';
        }
    });
</script>

<div class="grid grid-cols-5 join">
    <span class="flex items-end gap-2 mb-1 col-span-6">
        <Lockbutton class="join-item" bind:lock on:lockchange />
        {#if component === 'input' && !lock && fine_tune}
            {@const arr = fine_tuned_values
                .split(',')
                .map(v => v.trim())
                .filter(v => v !== '')}
            {#if arr.length < 2 || arr.length > 3}
                <TriangleAlert size="20" color="red" />
            {/if}
        {/if}
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
                placeholder={type === 'string' ? 'value1, value2, ...' : 'min, max, #N'}
                bind:value={fine_tuned_values}
                disabled={lock}
                on:change={() => {
                    if (!isString(fine_tuned_values)) return;
                    const arr = fine_tuned_values
                        .split(',')
                        .map(v => v.trim())
                        .filter(v => v !== '');
                    if (component === 'input') {
                        if (arr.length > 3 && type !== 'string') {
                            fine_tuned_values = arr.slice(0, 3).join(', ');
                            return toast.error('Max 3 values allowed for int/float type - min, max, #N');
                        }
                    }
                }}
            />
        {/if}
        {#if component === 'input'}
            <select
                class="select select-bordered select-sm join-item"
                bind:value={type}
                disabled={lock}
                class:col-span-2={type === 'string'}
            >
                <option disabled selected>type</option>
                <option>integer</option>
                <option>float</option>
                <option>string</option>
            </select>
            {#if type !== 'string'}
                <select class="select select-bordered select-sm join-item" bind:value={scale} disabled={lock}>
                    <option disabled selected>type</option>
                    <option>log</option>
                    <option>linear</option>
                    <!-- <option>null</option> -->
                </select>
            {/if}
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
                if (!value.includes(',')) return;

                const arr = value
                    .trim()
                    .split(',')
                    .map(v => v.trim())
                    .filter(v => v !== '');

                value = arr[0];
                if (arr.length === 1) {
                    return;
                }

                if (arr.length === 2 || arr.length === 3) {
                    fine_tuned_values = arr.join(', ');
                    fine_tune = true;
                    return;
                }

                if (arr.length > 3) {
                    fine_tuned_values = arr.slice(0, 3).join(', ');
                    fine_tune = true;
                    return toast.error('Max 3 values allowed - min, max, #N');
                }
            }}
        />
    {:else if component === null}
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
            dispatch('tuneModeChange', fine_tune);
        }}
    >
        <SlidersHorizontal size="20" />
    </button>
    <span class="text-sm col-span-6 mt-1 {lock ? 'text-gray-600/75' : ''}">
        {#if helper || helperHighlight}
            <div class="grid grid-cols-[1fr_auto] gap-1 text-xs text-wrap break-words">
                {#if helper}
                    <span class={lock ? 'text-gray-600/75' : ''}>{helper}</span>
                {/if}
                {#if helperHighlight}
                    <div class="badge badge-sm badge-neutral {lock ? 'text-gray-400' : ''}">
                        {helperHighlight}
                    </div>
                {/if}
            </div>
        {/if}
    </span>
    <slot />
</div>
