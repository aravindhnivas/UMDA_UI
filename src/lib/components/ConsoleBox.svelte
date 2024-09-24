<script lang="ts">
    export let console_arr: {
        type: 'success' | 'error' | 'warning' | 'info';
        value: string;
    }[] = [];

    export let max_height = '250px';
</script>

<div class="console__box card shadow-xl p-5" style:max-height={max_height}>
    <button class="btn btn-sm btn-outline ml-auto" on:click={() => (console_arr = [])}>Clear</button>
    <div class="body">
        {#each console_arr as obj}
            <span class="type-{obj.type}">>> {obj.value}</span>
        {/each}
    </div>
</div>

<style lang="scss">
    .console__box {
        // max-height: 250px;
        .body {
            margin-top: 1em;
            overflow: auto;
            display: flex;
            flex-direction: column;
            .type-error {
                color: red;
            }
            .type-success {
                color: green;
            }
        }
    }
</style>
