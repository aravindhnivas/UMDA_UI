<script lang="ts">
    export let value: boolean = false;
    export let label: string = '';
    export let bordered = true;
    let className = '';
    export { className as class };
    if (bordered) className += 'border-solid border-black border-1 rounded-md';
</script>

<div class="comp__div {className} form-control w-max">
    <label class="label cursor-pointer gap-2 flex">
        <span class="label-text">{label}</span>
        <input type="checkbox" class="toggle" bind:checked={value} />
    </label>
</div>

<style lang="scss">
    .comp__div {
        justify-content: center;
        label {
            padding: 0 0.2rem;
        }
    }
</style>
