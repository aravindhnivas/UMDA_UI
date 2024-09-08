<script lang="ts">
    import { RAM_SIZE, CPU_COUNT } from '$lib/stores/system';
    import { pyVersion, umdapyVersion } from '$lib/pyserver/stores';
    import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
    import Layout from './comp/Layout.svelte';
    import { arch, platform } from '@tauri-apps/api/os';
    import { asset_name_prefix } from './utils/download-assets';

    onMount(async () => {
        console.log('About page mounted');
        system_info.platform = await platform();
        system_info.arch = await arch();

        const asset_folder = await path.join(await path.appLocalDataDir(), asset_name_prefix);
        const umdapy_version_file = await path.join(asset_folder, '_internal', 'umdalib', '__version__.dat');
        if (!(await fs.exists(umdapy_version_file))) return;
        const umdapy_version_file_content = await fs.readTextFile(umdapy_version_file);
        if (!umdapy_version_file_content) return;
        $umdapyVersion = umdapy_version_file_content;
    });

    const system_info = {
        platform: '',
        arch: '',
    };
</script>

<Layout id="About" class="pl-5">
    <h1>About</h1>
    <div class="content">
        <ul class="ml-0 flex flex-col gap-1">
            <li>
                Platform: <span class="badge badge-info">{system_info.platform}-{system_info.arch}</span>
            </li>
            <li class="text-sm">RAM: <span class="badge badge-info">{$RAM_SIZE.toFixed(0)} GB RAM</span></li>
            <li class="text-sm">CPU: <span class="badge badge-info">{$CPU_COUNT.toFixed(0)} core</span></li>
            <hr />

            {#await getVersion() then value}
                <li>UMDA_UI: <span class="badge badge-info">v{value}</span></li>
            {/await}

            {#await getTauriVersion() then value}
                <li>Tauri: <span class="badge badge-info">v{value}</span></li>
            {/await}
            <li>
                Python: <span class="badge badge-info" class:badge-error={!$pyVersion}>{$pyVersion || 'unknown'}</span>
            </li>
            <li>
                umdapy: <span class="badge badge-info" class:badge-error={!$umdapyVersion}
                    >v{$umdapyVersion || 'unknown'}</span
                >
            </li>
            <hr />
        </ul>
    </div>
</Layout>
