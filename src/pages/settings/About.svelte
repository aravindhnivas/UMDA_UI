<script lang="ts">
    import { pyVersion, umdapyVersion } from '$lib/pyserver/stores';
    import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
    import Layout from './comp/Layout.svelte';
    import { git_url } from '$lib/utils/index';

    let py_modules: string[] = [];

    onMount(async () => {
        console.log('About page mounted');
        const [err, result] = await oO(axios(`${git_url.usercontent()}/src/requirements.txt`));
        if (err) return toast.error(err);
        py_modules = result?.data.split('\n') ?? '';
    });
</script>

<Layout id="About" class="pl-5">
    <h1>About</h1>
    <div class="content">
        <ul style="user-select: text;" class="ml-0">
            {#await getVersion() then value}
                <li>UMDA_UI: {value}</li>
            {/await}

            {#await getTauriVersion() then value}
                <li>Tauri: {value}</li>
            {/await}
            <li>Python {$pyVersion}</li>
            <li>umdapy {$umdapyVersion}</li>
            <hr />

            {#if $umdapyVersion && py_modules.length > 0}
                <h3>Python libraries</h3>
                {#each py_modules as module}
                    {#if module}
                        <li>{module}</li>
                    {/if}
                {/each}
            {/if}
        </ul>
    </div>
</Layout>
