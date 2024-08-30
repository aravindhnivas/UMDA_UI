<script lang="ts">
    import { afterUpdate } from 'svelte';
    import SmilesDrawer from 'smiles-drawer';
    import CustomInput from './CustomInput.svelte';

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
    <div class="text-lg">Molecular structure</div>
    {#if show_controls}
        <div class="flex gap-2 w-full">
            <div class="flex items-center gap-2">
                <span class="text-sm">Width: {width}px</span>
                <input type="range" bind:value={width} min="100" max="1000" step="10" class="range" />
            </div>
            <div class="flex items-center gap-2">
                <span class="text-sm">Height: {height}px</span>
                <input type="range" bind:value={height} min="100" max="1000" step="10" class="range" />
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
