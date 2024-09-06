<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Alert } from '$utils/stores';
    import FlatList from 'svelte-flatlist';

    let active = false;
    function openModal() {
        active = true;
        $Alert.open = false;
    }

    $: if ($Alert.open) {
        openModal();
    }
    let headerBackground = '#453b1c5c';
    const background_colors: {
        [key: string]: string;
    } = {
        info: '#453b1c5c',
        error: '#f14668',
        warn: '#f1c40f',
    };
    $: if (active) {
        headerBackground = background_colors[$Alert.type];
    }

    const title: {
        [key: string]: string;
    } = {
        info: 'Informations',
        error: 'Error Occured',
        warn: 'Caution!! Warning !!',
    };

    function handleKeydown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (key === 'escape') {
            active = false;
            return;
        }
        const { ctrlKey, shiftKey } = event;
        if (ctrlKey && shiftKey) {
            if (key === 'e') {
                active = !active;
            }
        }
    }

    onDestroy(() => (active = false));
</script>

<svelte:window on:keydown={handleKeydown} />

{#if active}
    <FlatList
        maxWidth="80vw"
        on:close={() => {
            active = false;
        }}
        bind:visible={active}
        style={{
            bgColor: '#eee',
            handle: {
                fgColor: 'white',
                height: '2rem',
                bgColor: headerBackground,
            },
        }}
    >
        <div class="contents">
            <h1 style="text-align: center;">
                {title[$Alert.type]}
            </h1>
            <hr />
            <code class="select-text" style="white-space: pre-wrap; overflow: auto;">
                {#if $Alert.content instanceof Error}
                    {$Alert.content.stack}
                {:else}
                    {$Alert.content}
                {/if}
            </code>
        </div>
    </FlatList>
{/if}

<style lang="scss">
    .contents {
        * {
            color: black;
        }
    }
</style>
