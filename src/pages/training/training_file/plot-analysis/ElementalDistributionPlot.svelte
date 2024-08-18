<script lang="ts">
    import { active_tab } from './stores';
    import BaseLayout from './BaseLayout.svelte';

    const name = 'elemental_distribution';
</script>

<BaseLayout {name} hidden={$active_tab !== name} />
