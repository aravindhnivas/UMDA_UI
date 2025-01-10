<script lang="ts">
    import { afterUpdate } from 'svelte';
    import SmilesDrawer from 'smiles-drawer';
    import { Proportions } from 'lucide-svelte/icons';

    export let smiles = '';
    export let width = 700;
    export let height = 400;
    export let show_controls = true;

    $: drawer = new SmilesDrawer.SvgDrawer({ width, height });
    let svgElement: SVGElement;

    afterUpdate(() => {
        if (!smiles || !drawer) return;
        SmilesDrawer.parse(smiles, function (tree: any) {
            drawer.draw(tree, svgElement, 'light');
        });
    });
</script>

<div class="grid gap-1">
    <div class="flex gap-2">
        <!-- <div class="text-lg">Molecular structure</div> -->
        <button class="btn btn-sm btn-outline" on:click={() => (show_controls = !show_controls)}>
            <!-- Adjust proportions -->
            <Proportions size="20" />
        </button>
    </div>
    {#if show_controls}
        <div class="grid grid-cols-5 gap-2">
            <div class="col-span-2 grid gap-1">
                <span class="text-sm">Width: {width}px</span>
                <input class="range range-xs" type="range" bind:value={width} min="100" max="1000" step="10" />
            </div>
            <div class="grid gap-1 col-span-2">
                <span class="text-sm">Height: {height}px</span>
                <input class="range range-xs" type="range" bind:value={height} min="100" max="1000" step="10" />
            </div>
            <button class="btn btn-sm btn-outline" on:click={() => ((width = 700), (height = 400))}>Restore</button>
        </div>
    {/if}
    <div class="flex-center rounded-1">
        <svg
            style:width
            style:height
            style="background-color: antiquewhite;"
            bind:this={svgElement}
            data-smiles={smiles}
        />
    </div>
</div>
