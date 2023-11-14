<script>
    import { active_settings_tab } from '$settings/stores';
    const items = ['Configuration', 'Update', 'Console', 'About', 'Credits'];
</script>

<ul class="menu w-full rounded-box">
    {#each items as item}
        <li
            class="cursor-default mb-2"
            on:click={() => {
                $active_settings_tab = item;
            }}
        >
            <a class:active={$active_settings_tab === item}>{item}</a>
        </li>
    {/each}
</ul>
