<script lang="ts">
    export let value: boolean = false;
    export let label: string = '';

    let className = '';
    export { className as class };
</script>

<div class="form-control w-45 border-solid border-black border-1 rounded-md {className}">
    <label class="label cursor-pointer">
        <span class="label-text">{label}</span>
        <input type="checkbox" class="toggle" bind:checked={value} />
    </label>
</div>
