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
    class="card w-full h-full bg-orange-300 bg-opacity-50 shadow-xl animate__animated animate__fadeIn"
>
    <slot name="body" />
</Splitpanes>
