<script lang="ts">
    import { BrowseBtn } from '$components/index';

    let developer_mode = true;
    $: console.log(developer_mode);
</script>

<div id="Settings_Configuration" class="mt-4">
    <div class="flex items-center gap-1">
        <div class="form-control w-45 border-solid border-1 rounded-md" class:border-blue={developer_mode}>
            <label class="label cursor-pointer">
                <span class="label-text">Developer mode</span>
                <input type="checkbox" class="toggle" bind:checked={developer_mode} />
            </label>
        </div>
        <button class="btn btn-primary btn-sm">get PyVersion</button>
    </div>
    <BrowseBtn dir={false} />
</div>

<style lang="scss">
    #Settings_Configuration {
        display: grid;
        grid-auto-flow: row;
        gap: 1em;
    }
</style>
