<script lang="ts">
    import { pyServerReady } from '$lib/pyserver/stores';
    import {
        python_asset_ready,
        installing_python_assets,
        python_asset_ready_to_install,
    } from '$settings/utils/stores';
    import { start_and_check_umdapy_with_toast } from '$lib/pyserver/umdapyServer';
    import { check_umdapy_assets_status } from '$settings/utils/assets-status';
    import { ServerOff, AlertTriangle, Download } from 'lucide-svelte/icons';
</script>

<div class="flex py-0" style="gap: 0.5em;">
    <div aria-label="click to  start python server" data-cooltipz-dir="left">
        {#if !$pyServerReady}
            <button
                on:click={async () => {
                    await start_and_check_umdapy_with_toast();
                }}
            >
                <ServerOff size="20" />
            </button>
        {/if}
    </div>

    {#if !$python_asset_ready}
        <div aria-label="click to check python assets" data-cooltipz-dir="left">
            <button
                on:click={async () => {
                    await check_umdapy_assets_status();
                }}
            >
                <AlertTriangle size="20" />
            </button>
        </div>
    {/if}

    {#if $python_asset_ready_to_install && !$installing_python_assets}
        <button
            class="flex gap-2"
            aria-label={'click to install'}
            data-cooltipz-dir={'left'}
            on:click={() => {
                const installBtn = document.getElementById('install-asset-btn');
                if (installBtn) installBtn.click();
            }}
        >
            <span style="color: black;">umdapy assets ready to install</span>
            <Download />
        </button>
    {/if}
</div>
