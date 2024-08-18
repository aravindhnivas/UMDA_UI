<script lang="ts">
    import { active_tab } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import Slider from '@smui/slider';

    const name = 'size_distribution';

    let atomic_size_range = [1, 200];
    let min_atomic_number = 1;
    let max_atomic_number = 50;

    const on_plot = (e: CustomEvent) => {
        console.log(e.detail);
        const { x } = e.detail as { x: string[] };
        const max = Number(x.at(-1)?.split('-')[1] ?? 0);
        max_atomic_number = max;
        atomic_size_range = [1, max];
        console.log({ atomic_size_range, max_atomic_number });
    };
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={on_plot}>
    <pre class="status">Atomic size range: {min_atomic_number} - {max_atomic_number}</pre>
    <Slider
        range
        bind:start={min_atomic_number}
        bind:end={max_atomic_number}
        min={atomic_size_range[0]}
        max={atomic_size_range[1]}
        step={1}
        minRange={1}
        input$aria-label="Range slider"
    />
</BaseLayout>
