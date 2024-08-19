<script lang="ts">
    import { active_tab } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import Chip, { Set, Text } from '@smui/chips';

    const name = 'elemental_distribution';

    let plotted = false;
    let choices: string[] = [];
    let selected: string[] = [];

    let select_all = true;

    const on_plot = async (e: CustomEvent) => {
        plotted = true;
        console.log(e.detail);

        choices = e.detail.x as string[];
        await tick();
        selected = [...choices];
        select_all = true;
    };
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={on_plot}>
    <!-- {#if plotted} -->
    <h3>Filtering</h3>
    <button
        class="btn btn-sm w-max"
        on:click={() => {
            selected = select_all ? [...choices] : [];
            select_all = !select_all;
        }}>Select {select_all ? 'all' : 'none'}</button
    >
    <Set chips={choices} let:chip filter bind:selected>
        <Chip {chip} touch>
            <Text>{chip}</Text>
        </Chip>
    </Set>
    <pre class="status">Selected: {selected.length} elements</pre>
    <!-- {/if} -->
</BaseLayout>
