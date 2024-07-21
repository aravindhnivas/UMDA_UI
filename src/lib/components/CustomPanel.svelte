<script lang="ts">
    import { Panel, Header, Content } from '@smui-extra/accordion';
    import { ArrowDown, ArrowDownCircle, ArrowUp, ArrowUpCircle } from 'lucide-svelte/icons';

    export let title: string;
    export let open: boolean = false;
</script>

<Panel style="background-color: coral;" bind:open>
    <Header>
        <div class="flex justify-between items-center">
            <span>{title}</span>

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
