<script>
    import { active_tab } from '$utils/stores';
    import { Splitpanes } from 'svelte-splitpanes';
    export let id = 'Home';
</script>

<Splitpanes
    theme="my-theme"
    horizontal={false}
    {id}
    style="display: {$active_tab === id ? 'flex' : 'none'};"
    class="card bg-orange-300/50 shadow-xl animate__animated animate__fadeIn h-full w-full overflow-hidden rounded-none"
>
    <slot name="body" />
</Splitpanes>
