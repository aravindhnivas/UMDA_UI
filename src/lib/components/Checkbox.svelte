<script lang="ts">
    export let value: boolean = false;
    export let label: string = '';
    export let bordered = true;
    export let check: 'toggle' | 'checkbox' = 'toggle';
    export let text_position: 'left' | 'right' = 'left';
    let className = '';
    export { className as class };
    if (check === 'checkbox') {
        text_position = 'right';
        bordered = false;
    }
</script>

<div class="comp__div form-control w-max {bordered && 'border-solid border-black border-1 rounded-md'} {className}">
    <label class="label cursor-pointer gap-2 flex">
        {#if text_position === 'left'}
            <span class="label-text">{label}</span>
        {/if}
        <input type="checkbox" class={check} bind:checked={value} />
        {#if text_position === 'right'}
            <span class="label-text">{label}</span>
        {/if}
    </label>
</div>

<style lang="scss">
    .comp__div {
        justify-content: center;
        label {
            padding: 0 0.2rem;
        }
    }

    input.checkbox {
        border: solid 1px #000;
    }
</style>
