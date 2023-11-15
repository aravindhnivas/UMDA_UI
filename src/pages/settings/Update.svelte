<script lang="ts">
    import { BrowseBtn, Checkbox } from '$components/index';
    import Textfield from '@smui/textfield';
    import Layout from './comp/Layout.svelte';

    let developer_mode = true;
    let port_lock = false;
    let server: {
        status: 'error' | 'success';
        port: number;
        pid: number;
    } = {
        status: 'error',
        port: 5050,
        pid: 1234,
    };

    const fetch_port = () => {
        if (port_lock) return toast.warning('Port is locked');
    };
</script>

<Layout id="Update">
    <div class="flex gap-1">
        <div class="badge badge-error">Invalid python</div>
        <div class="badge badge-{server.status}">Server running</div>
    </div>

    <div class="flex items-center gap-1">
        <button class="btn">get PyVersion</button>
        <Checkbox class="ml-auto" bind:value={developer_mode} label="Developer mode" />
    </div>

    <BrowseBtn value="python" dir={false} label="Enter python location or python keyword" />
    <BrowseBtn value="" dir={true} label="Python source file" />

    <div class="flex items-center gap-1">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <i on:click={fetch_port} class="i-material-symbols-refresh"></i>

        <Textfield disabled={port_lock} type="number" bind:value={server.port} label="ServerPORT" />

        {#if port_lock}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => (port_lock = false)} class="i-material-symbols-lock-outline"></i>
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <i on:click={() => (port_lock = true)} class="i-material-symbols-lock-open-right-outline"></i>
        {/if}

        <button class="btn">Start Server</button>
        <button class="btn btn-error">Stop Server</button>
    </div>

    <div class="flex gap-1 items-center">
        <button class="btn">Check Server connection</button>
        <button class="btn">Check PORT status</button>

        <Textfield value="" label="current port PID" />
        <button class="btn btn-error">kill PID</button>
    </div>

    <!-- <div class="card shadow-xl bg-orange-300 w-full h-[100rem] overflow-auto p-5">Card</div> -->
</Layout>
