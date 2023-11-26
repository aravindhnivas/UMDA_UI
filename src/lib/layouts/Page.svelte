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
    class="box__div animate__animated animate__fadeIn"
>
    <slot name="body" />
</Splitpanes>
