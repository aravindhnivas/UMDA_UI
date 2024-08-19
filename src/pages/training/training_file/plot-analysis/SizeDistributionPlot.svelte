<script lang="ts">
    import { active_tab } from './stores';
    import BaseLayout from './BaseLayout.svelte';
    import CustomInput from '$lib/components/CustomInput.svelte';
    import { Ampersand, ChevronLeft, ChevronRight, Equal } from 'lucide-svelte';
    import Chip, { Set, Text } from '@smui/chips';

    const name = 'size_distribution';

    let min_atomic_number: string = '1';
    let max_atomic_number: string;
    let count_threshold: number;
    let x: string[] = [];
    let y: number[] = [];

    let plotted = false;

    const on_plot = (e: CustomEvent) => {
        plotted = true;
        console.log(e.detail);
        x = e.detail.x as string[];
        y = e.detail.y as number[];
        count_threshold = y[0] ?? 0;
        min_atomic_number = x[0]?.split('-')[0] ?? '1';
        if (min_atomic_number == '0') min_atomic_number = '1';
        max_atomic_number = x.at(-1)?.split('-')[1] ?? '';
    };

    let activate = {
        min_atomic_number: false,
        max_atomic_number: false,
        count_threshold: false,
    };

    let choices: string[] = ['min', 'max', 'count threshold'];
    let selected: string[] = [];
</script>

<BaseLayout {name} hidden={$active_tab !== name} on:plot={on_plot}>
    <Set chips={choices} let:chip filter bind:selected>
        <Chip {chip} touch>
            <Text>{chip}</Text>
        </Chip>
    </Set>
    {#if plotted}
        <h3>Filtering</h3>
        <div class="flex gap-3 items-end">
            <button
                class="icon-button hover:bg-white"
                class:bg-white={activate.min_atomic_number}
                on:click={() => (activate.min_atomic_number = !activate.min_atomic_number)}
            >
                <ChevronRight />
                <Equal />
            </button>

            <CustomInput bind:value={min_atomic_number} label="Min" />

            <button
                class="icon-button hover:bg-white"
                class:bg-white={activate.max_atomic_number}
                on:click={() => (activate.max_atomic_number = !activate.max_atomic_number)}
            >
                <ChevronLeft />
                <Equal />
            </button>

            <CustomInput bind:value={max_atomic_number} label="Max" />

            <button
                class="icon-button hover:bg-white"
                class:bg-white={activate.count_threshold}
                on:click={() => (activate.count_threshold = !activate.count_threshold)}
            >
                <Ampersand />
            </button>
            <CustomInput bind:value={count_threshold} label="count threshold" />
        </div>
    {/if}
</BaseLayout>

<style lang="scss">
    .icon-button {
        @apply flex border border-solid border-1 border-rounded;
    }
</style>
