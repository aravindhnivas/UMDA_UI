<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Alert } from '$utils/stores';
    import FlatList from 'svelte-flatlist';
    import { SearchIcon, Delete, ClipboardCopy, CheckCheck } from 'lucide-svelte/icons';
    import { copyText } from 'svelte-copy';

    // let active = true;
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
    let searchText = '';
    function highlightSearchText(text: string, searchText: string) {
        if (!searchText) return text;
        if (!text) return '';
        return text.replace(new RegExp(searchText, 'gi'), match => `<span class="bg-yellow-200">${match}</span>`);
    }
    let copied = false;
</script>

<svelte:window on:keydown={handleKeydown} />

{#if active}
    <FlatList
        maxWidth="80vw"
        on:close={() => {
            active = false;
            searchText = '';
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
            <div class="flex justify-between">
                <button
                    class="btn btn-sm"
                    on:click={() => {
                        copyText($Alert.content?.stack || $Alert.content);
                        toast.success('copied to clipboard');
                        copied = true;
                        setTimeout(() => (copied = false), 2000);
                    }}
                >
                    <span transition:fade>{copied ? 'Copied' : 'Copy'}</span>
                    {#if copied}
                        <CheckCheck />
                    {:else}
                        <ClipboardCopy size={16} />
                    {/if}
                </button>
                <div class="flex-gap">
                    <div class="relative w-full">
                        <input
                            class="input input-xs input-bordered w-full pr-8"
                            type="text"
                            bind:value={searchText}
                            placeholder="Search"
                            autocomplete="off"
                            autocapitalize="off"
                            autocorrect="off"
                        />
                        {#if searchText}
                            <button
                                class="absolute right-2 top-1/2 transform -translate-y-1/2"
                                on:click={() => (searchText = '')}
                            >
                                <Delete size={16} />
                            </button>
                        {/if}
                    </div>
                    <SearchIcon size={20} />
                </div>
            </div>
            <div class="divider"></div>
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
