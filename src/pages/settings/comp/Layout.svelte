<script lang="ts">
    import { active_settings_tab } from '../stores';
    export let id = 'Configuration';
    export let display = 'grid';

    let className = '';
    export { className as class };
</script>

<div
    id="Settings_{id}"
    class="m-5 w-ful h-full content-start gap-1 {className}"
    style="display: {$active_settings_tab === id ? display : 'none'};"
>
    <slot />
</div>
