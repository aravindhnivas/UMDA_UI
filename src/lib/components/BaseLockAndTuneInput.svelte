<script lang="ts">
    import { UnlockKeyhole, LockKeyhole, SlidersHorizontal } from 'lucide-svelte/icons';

    export let component: 'input' | 'select' | 'checkbox';
    export let value: string | number | boolean;
    export let label: string = '';
    export let helper: string = '';
    export let helperHighlight: string = '';
    export let lock: boolean | null = null;
    export let disabled = false;
    export let fine_tune: boolean | null = null;
    export let fine_tuned_value: string | null = null;
    export let items: string[] = [];

    let className = '';
    export { className as class };

    $: element_disabled = disabled || lock;
    $: if (!lock && component === 'input' && fine_tune !== null && typeof value === 'string') {
        fine_tune = value.includes(',');
        if (fine_tune && !value.trim().endsWith(',')) fine_tuned_value = value;
    }
    $: if (!lock && component === 'select' && fine_tune && !fine_tuned_value) {
        fine_tuned_value = items.filter(f => f !== 'float').join(', ');
    }
    $: if (!lock && component === 'checkbox' && fine_tune) {
        fine_tuned_value = 'true, false';
    }

    $: if (lock || !fine_tune) fine_tuned_value = null;
    $: if (lock && (component === 'select' || component === 'checkbox')) fine_tune = false;

    const input_attr = {
        autocomplete: 'off',
        autocapitalize: 'off',
        autocorrect: 'off',
    };
    // $: console.log({ value, fine_tune, fine_tuned_value });
    onMount(() => {
        if (component === 'input') {
            if (!value) value = '';
            if (typeof value !== 'string') value = value.toString();
        }
    });
</script>

<div class="grid gap-1 {className}">
    {#if label}
        <div class="flex items-center gap-1">
            {#if lock !== null}
                <button on:click={() => (lock = !lock)}>
                    {#if lock}
                        <LockKeyhole size="20" class="text-gray-700" />
                    {:else}
                        <UnlockKeyhole size="20" />
                    {/if}
                </button>
            {/if}
            <span class="text-xs {element_disabled ? 'text-gray-600/75' : ''}">
                {label}{element_disabled ? ' (locked)' : ''}
            </span>
        </div>
    {/if}
    <div class="grid grid-cols-[1fr_auto] gap-1">
        {#if component === 'input'}
            <input
                class="w-full input input-sm {element_disabled ? 'bg-gray-600/25' : ''}"
                bind:value
                on:change={() => {
                    if (typeof value !== 'string') return;
                    value = value.trim();
                    if (fine_tune === null) return;
                    if (value.endsWith(',')) value = value.slice(0, -1);
                }}
                disabled={element_disabled}
                {...input_attr}
            />
        {:else if component === 'checkbox' && typeof value === 'boolean' && !fine_tune}
            <div class="flex items-center gap-2 border border-black rounded-xl p-1">
                <input type="checkbox" class="toggle" bind:checked={value} disabled={element_disabled} on:change />
                <span class="text-xs">{value ? 'true' : 'false'}</span>
            </div>
        {:else if component === 'checkbox' && fine_tune}
            <input
                class="w-full input input-sm {element_disabled ? 'bg-gray-600/25' : ''}"
                value={fine_tuned_value}
                disabled={true}
            />
        {:else if fine_tune}
            <input
                class="w-full input input-sm {element_disabled ? 'bg-gray-600/25' : ''}"
                bind:value={fine_tuned_value}
                on:change={() => {
                    if (typeof fine_tuned_value !== 'string') return;
                    fine_tuned_value = fine_tuned_value.trim();
                    if (fine_tuned_value.endsWith(',')) fine_tuned_value = fine_tuned_value.slice(0, -1);
                }}
                disabled={element_disabled}
                {...input_attr}
            />
        {:else}
            <select
                class="w-full select select-sm select-bordered {element_disabled ? 'bg-gray-600/25' : ''}"
                bind:value
                on:change={() => {
                    if (typeof value !== 'string') return;
                    value = value.trim();
                    if (fine_tune === null) return;
                    if (value.endsWith(',')) value = value.slice(0, -1);
                }}
                disabled={element_disabled}
            >
                {#if items?.length > 0}
                    <option disabled selected>{label}</option>
                    {#each items as item}
                        <option>{item}</option>
                    {/each}
                {/if}
            </select>
        {/if}
        {#if fine_tune !== null && !lock}
            <button
                class="flex gap-1 items-center btn btn-sm btn-square"
                class:btn-info={fine_tune}
                on:click={() => {
                    if (component === 'select' || component === 'checkbox') {
                        fine_tune = !fine_tune;
                        return;
                    }
                    if (typeof value !== 'string') return;
                    value = value.trim();
                    if (!value.includes(',')) return;
                    value = value.split(',')[0].trim();
                }}
            >
                <SlidersHorizontal size="20" />
            </button>
        {/if}
    </div>

    {#if helper || helperHighlight}
        <div class="grid grid-cols-[1fr_auto] gap-1 text-xs text-wrap break-words">
            {#if helper}
                <span class={element_disabled ? 'text-gray-600/75' : ''}>{helper}</span>
            {/if}
            {#if helperHighlight}
                <div class="badge badge-sm badge-neutral {element_disabled ? 'text-gray' : ''}">
                    {helperHighlight}
                </div>
            {/if}
        </div>
    {/if}

    <slot />
</div>
