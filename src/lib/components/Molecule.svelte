<script lang="ts">
    import { afterUpdate } from 'svelte';
    import SmilesDrawer from 'smiles-drawer';

    export let smiles = '';

    const SETTINGS = {
        width: 300,
        height: 200,
    };
    let drawer = new SmilesDrawer.SvgDrawer(SETTINGS);
    let svgElement: SVGElement;

    afterUpdate(() => {
        SmilesDrawer.parse(smiles, function (tree) {
            drawer.draw(tree, svgElement, 'light');
        });
    });
</script>

<div class="flex-center">
    <svg bind:this={svgElement} data-smiles={smiles} />
</div>

<style>
    svg {
        width: 300px;
        height: 200px;
    }
</style>
