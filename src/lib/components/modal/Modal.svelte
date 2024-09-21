<script lang="ts">
    export let title: string = 'Title';
    export let label: string = 'Open';
    export let open: boolean = false;

    let dialog_element: HTMLDialogElement;
    const openModal = () => {
        if (!dialog_element) return toast.error('Dialog element not found');
        dialog_element.showModal();
        open = true;
    };

    $: if (dialog_element && open) dialog_element.showModal();
</script>

<slot name="button-slot" {openModal} {label}>
    <button class="flex btn btn-sm btn-outline" on:click={openModal}>{label}</button>
</slot>

<dialog bind:this={dialog_element} class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold">{title}</h3>
        <p class="py-4"><slot /></p>
    </div>
</dialog>

<style>
    .modal-box {
        background-color: color(srgb 1 0.6247 0.31);
    }
</style>
