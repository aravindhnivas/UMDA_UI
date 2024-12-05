<script lang="ts">
    import CustomInput from './CustomInput.svelte';
    import { UnlockKeyhole, LockKeyhole, CircleHelp, Pencil, PencilOff } from 'lucide-svelte/icons';

    export let label: string = '';
    export let value: string;
    export let items: string[] | Record<string, string[]> = [];
    export let helper: string = '';
    export let helperHighlight: string = '';
    export let disabled = false;
    export let use_input = false;
    export let enable_use_input = false;
    export let enabled_lock_mode = false;
    export let lock = false;
    export let hoverHelper: string = '';

    let className = '';
    export { className as class };

    onMount(() => {
        if (enable_use_input && use_input) return;

        if (value && isArray(items) && items.length === 0) {
            items = [value];
        }
    });

    const toggle_select = (e: MouseEvent) => {
        if (element_disabled) return;
        e.stopPropagation();
        if (e.altKey && e.shiftKey) {
            use_input = !use_input;
        }
    };
    $: element_disabled = disabled || (enabled_lock_mode && lock);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={toggle_select}>
    {#if enable_use_input && use_input}
        <CustomInput
            bind:value
            label={`Enter ${label}`}
            placeholder={`Enter ${label}`}
            bind:lock
            {enabled_lock_mode}
            {disabled}
        >
            <svelte:fragment slot="post-input-within">
                <button
                    class="join-item"
                    on:click={() => {
                        use_input = !use_input;
                    }}
                >
                    <PencilOff size="20" />
                </button>
            </svelte:fragment>
        </CustomInput>
    {:else}
        <div class="flex flex-col gap-1 {className}">
            <div class="flex gap-1 items-center">
                {#if label}
                    <!-- <span class="text-xs pl-1 {element_disabled ? 'text-gray-600/75' : ''}">{label}</span> -->
                    <div class="flex-gap {element_disabled ? 'text-gray-600/75' : ''}">
                        <span class="text-xs">{label}</span>
                        {#if hoverHelper}
                            <span aria-label={hoverHelper} data-cooltipz-dir="top" data-cooltipz-size="medium">
                                <CircleHelp size="16" />
                            </span>
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="join">
                {#if enable_use_input}
                    <button
                        class="btn btn-sm btn-square btn-outline join-item"
                        on:click={() => {
                            use_input = !use_input;
                        }}
                    >
                        <Pencil size="20" />
                    </button>
                {/if}
                <slot name="pre-within" {lock} />
                <select
                    class="select select-sm select-bordered join-item {element_disabled ? 'bg-gray-600/25' : ''}"
                    bind:value
                    on:change
                    disabled={element_disabled}
                >
                    {#if isArray(items) && items.length > 0}
                        <option disabled>{label}</option>
                        {#each items as item}
                            <option>{item}</option>
                        {/each}
                    {:else if isObject(items)}
                        {#each Object.keys(items) as key}
                            {@const nested_items = items[key]}
                            <option disabled>{key}</option>
                            {#each nested_items as item}
                                <option>{item}</option>
                            {/each}
                        {/each}
                    {/if}
                </select>
                <slot name="post-within" {lock} />

                {#if enabled_lock_mode}
                    <button class="btn btn-sm btn-square btn-outline join-item" on:click={() => (lock = !lock)}>
                        {#if lock}
                            <LockKeyhole size="20" />
                        {:else}
                            <UnlockKeyhole size="20" />
                        {/if}
                    </button>
                {/if}
            </div>

            {#if helper || helperHighlight}
                <span class="text-xs pl-1 text-wrap break-words {element_disabled ? 'text-gray-600/75' : ''}">
                    {#if helper}
                        {helper}
                        <br />
                    {/if}
                    {#if helperHighlight}
                        <div class="badge badge-sm badge-neutral {element_disabled ? 'text-gray' : ''}">
                            {helperHighlight}
                        </div>
                    {/if}
                </span>
            {/if}
            <slot />
        </div>
    {/if}
</div>
