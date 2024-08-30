<script lang="ts">
    import { afterUpdate } from 'svelte';
    import SmilesDrawer from 'smiles-drawer';
    import CustomInput from './CustomInput.svelte';

    export let smiles = '';
    export let width = 900;
    export let height = 500;
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
    <div class="text-sm">Molecular structure</div>
    <div class="flex-center rounded-1" style="background-color: antiquewhite;">
        <svg style:width style:height bind:this={svgElement} data-smiles={smiles} />
    </div>
    {#if show_controls}
        <div class="flex items-end gap-2 flex-wrap">
            <CustomInput placeholder="width" bind:value={width} label="width" type="number" />
            <CustomInput placeholder="height" bind:value={height} label="height" type="number" />
            <!-- <button class="btn btn-sm">Adjust</button> -->
        </div>
    {/if}
</div>
