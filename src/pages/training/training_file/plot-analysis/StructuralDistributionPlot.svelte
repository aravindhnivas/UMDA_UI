<script lang="ts">
    import { active_tab } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import Chip, { Set, Text } from '@smui/chips';
    const name = 'structural_distribution';

    let plotted = false;
    let choices: string[] = [];
    let selected: string[] = [];
    const on_plot = async (e: CustomEvent) => {
        plotted = true;
        console.log(e.detail);

        choices = e.detail.x as string[];
        await tick();
        selected = [...choices];
    };
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={on_plot}>
    {#if plotted}
        <h3>Filtering</h3>
        <Set chips={choices} let:chip filter bind:selected>
            <Chip {chip} touch>
                <Text>{chip}</Text>
            </Chip>
        </Set>
        <pre class="status">Selected: {selected.length} categories</pre>
    {/if}
</BaseLayout>
