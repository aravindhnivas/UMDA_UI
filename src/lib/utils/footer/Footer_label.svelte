<script lang="ts">
    import { pyServerReady } from '$lib/pyserver/stores';
    import {
        python_asset_ready,
        installing_python_assets,
        python_asset_ready_to_install,
    } from '$settings/utils/stores';
    import { start_and_check_umdapy_with_toast } from '$lib/pyserver/umdapyServer';
    import { check_umdapy_assets_status } from '$settings/utils/assets-status';
</script>

<div class="flex py-0" style="gap: 0.5em;">
    <div aria-label="click to  start python server" data-cooltipz-dir="left">
        {#if !$pyServerReady}
            <button
                class="i-mdi-server-off bg-white text-xs"
                on:click={async () => {
                    await start_and_check_umdapy_with_toast();
                }}
            />
        {/if}
    </div>

    {#if !$python_asset_ready}
        <div aria-label="click to check python assets" data-cooltipz-dir="left">
            <button
                class="i-subway-missing bg-white text-xs"
                on:click={async () => {
                    await check_umdapy_assets_status();
                }}
            />
        </div>
    {/if}

    {#if $python_asset_ready_to_install && !$installing_python_assets}
        <div
            role="presentation"
            class="tag is-warning gap-2"
            style="cursor: pointer;"
            aria-label={'click to install'}
            data-cooltipz-dir={'left'}
            on:click={() => {
                const installBtn = document.getElementById('install-asset-btn');
                if (installBtn) installBtn.click();
            }}
        >
            <span style="color: black;">umdapy assets ready to install</span>
            <i class="i-ic-baseline-install-desktop" />
        </div>
    {/if}
</div>
