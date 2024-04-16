<script lang="ts">
    import { terminal_log } from '$settings/utils/stores';
    import Layout from './comp/Layout.svelte';
    import TerminalBox from '$lib/components/TerminalBox.svelte';
</script>

<Layout id="Console" class="pl-5">
    <TerminalBox bind:terminal={$terminal_log} />
</Layout>
