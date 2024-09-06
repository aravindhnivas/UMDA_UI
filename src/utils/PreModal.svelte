<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Alert } from '$utils/stores';
    import FlatList from 'svelte-flatlist';
    import { SearchIcon } from 'lucide-svelte';

    let active = true;
    // let active = false;
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
    let searchText = '';
    function highlightSearchText(text: string, searchText: string) {
        return text.replace(new RegExp(searchText, 'gi'), match => `<span class="bg-yellow-200">${match}</span>`);
    }
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
            <h1 style="text-align: center;">{title[$Alert.type]}</h1>
            <!-- search text -->

            <div class="flex items-center gap-2 ml-auto min-w-xl">
                <input
                    class="input input-xs input-bordered w-full"
                    type="text"
                    bind:value={searchText}
                    placeholder="Search"
                />
                <SearchIcon size={20} />
            </div>

            <hr />
            <code class="select-text" style="white-space: pre-wrap; overflow: auto;">
                {#if $Alert.content instanceof Error}
                    {$Alert.content.stack}
                {:else}
                    {@html highlightSearchText($Alert.content, searchText)}
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
