<script lang="ts">
    export let url: string;
    export let name: string;
</script>

<button
    class="btn btn-sm btn-primary"
    on:click={async () => {
        await shell.open(url);
    }}>Open {name}</button
>
