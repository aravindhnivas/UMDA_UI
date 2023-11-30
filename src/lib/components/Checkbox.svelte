<script lang="ts">
    export let value: boolean = false;
    export let label: string = '';

    let className = '';
    export { className as class };
</script>

<div class="comp__div {className} form-control border-solid border-black border-1 rounded-md">
    <label class="label cursor-pointer gap-2 flex">
        <span class="label-text">{label}</span>
        <input type="checkbox" class="toggle" bind:checked={value} />
    </label>
</div>

<style lang="scss">
    .comp__div {
        label {
            padding: 0 0.2rem;
        }

        justify-content: center;
    }
</style>
