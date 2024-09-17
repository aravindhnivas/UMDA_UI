<script lang="ts">
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import { ArrowDownCircle, ArrowUpCircle } from 'lucide-svelte/icons';

    export let title: string = 'Panel title';
    export let open: boolean = false;
</script>

<Panel style="background-color: coral;" bind:open>
    <Header>
        <div class="flex justify-between items-center">
            <slot name="title" {open}><span>{title}</span></slot>

            {#if open}
                <span class="text-white">
                    <ArrowUpCircle />
                </span>
            {:else}
                <ArrowDownCircle />
            {/if}
        </div>
    </Header>
    <Content><slot /></Content>
</Panel>
