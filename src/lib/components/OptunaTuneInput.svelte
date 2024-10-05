<script lang="ts">
    import Lockbutton from './Lockbutton.svelte';

    export let label: string = 'label';
    export let description: string = 'description';
    export let low: string | number = '';
    export let high: string | number = '';
    export let step: string | number = '';
    export let type: 'int' | 'float' | 'categorical' = 'float';
    export let scale: 'log' | '' = 'log';
    export let lock: boolean = false;
</script>

<div class="grid grid-cols-5 join border border-rounded p-2" class:border-gray-600={lock}>
    <span class="flex items-end gap-2 mb-1 col-span-5">
        <Lockbutton class="join-item" bind:lock />
        <span class="text-sm {lock ? 'text-gray-600/75' : ''}">{label}</span>
    </span>
    {#if type === 'categorical'}
        <input
            class="input input-bordered input-sm join-item col-span-3"
            placeholder="categories"
            bind:value={low}
            disabled={lock}
        />
    {:else}
        <input class="input input-bordered input-sm join-item" placeholder="low" bind:value={low} disabled={lock} />
        <input class="input input-bordered input-sm join-item" placeholder="high" bind:value={high} disabled={lock} />
        <input class="input input-bordered input-sm join-item" placeholder="step" bind:value={step} disabled={lock} />
    {/if}
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
        <option>categorical</option>
    </select>

    <span class="text-sm col-span-5 {lock ? 'text-gray-600/75' : ''}">{description}</span>
</div>
