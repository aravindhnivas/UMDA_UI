<script lang="ts">
    import { RAM_SIZE, CPU_COUNT } from '$lib/stores/system';
    import { pyVersion, umdapyVersion } from '$lib/pyserver/stores';
    import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
    import Layout from './comp/Layout.svelte';
    import { arch, platform } from '@tauri-apps/api/os';
    // import { git_url } from '$lib/utils/index';

    // let py_modules: string[] = [];

    onMount(async () => {
        console.log('About page mounted');
        // try {
        //     const response = await axios.get(`${git_url.py.usercontent()}/src/requirements.txt`);
        //     py_modules = response.data.split('\n').filter(Boolean);
        // } catch (error) {
        //     console.error('Error fetching requirements:', error);
        //     toast.error('Failed to fetch Python modules');
        // }

        system_info.platform = await platform();
        system_info.arch = await arch();
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

            <!-- {#if $umdapyVersion && py_modules.length > 0}
                <h3>Python libraries</h3>
                {#each py_modules as module}
                    {#if module}
                        <li>{module}</li>
                    {/if}
                {/each}
            {/if} -->
        </ul>
    </div>
</Layout>
