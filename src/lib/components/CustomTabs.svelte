<script lang="ts">
    import type { SvelteComponent } from 'svelte';

    export let tabs: { tab: string; component?: typeof SvelteComponent }[];
    export let active: string;

    let className = 'boxed';
    export { className as class };
</script>

<div role="tablist" class="tabs tabs-{className} w-max rounded-xl {className === 'boxed' ? 'bg-base-200/50' : ''}">
    {#each tabs as { tab, component } (tab)}
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            on:click={() => {
                active = tab;
            }}
            role="tab"
            class="flex-center tab transition-all duration-300 ease-in-out"
            class:tab-active={active === tab}
        >
            {#if component}
                <svelte:component this={component}></svelte:component>
            {/if}
            <span class="font-semibold">{tab.toLocaleUpperCase()}</span>
        </div>
    {/each}
</div>
