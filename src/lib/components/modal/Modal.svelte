<script lang="ts">
    import { getID } from '$lib/utils/initialise';

    export let id: string = getID();
    export let title: string = 'Title';
    export let label: string = 'Open';
    const openModal = () => {
        const modal = document.getElementById(id) as HTMLDialogElement;
        if (!modal) return toast.error('Modal not found');
        modal.showModal();
    };
</script>

<button class="btn btn-sm w-max" on:click={openModal}>{label}</button>

<dialog {id} class="modal">
    <div class="modal-box">
        <div class="flex justify-between p-y-2">
            <h3 class="font-bold text-lg">{title}</h3>
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost">✕</button>
            </form>
        </div>
        <hr />
        <div class="p-y-2">
            <slot />
        </div>
    </div>
</dialog>

<style>
    .modal-box {
        background-color: color(srgb 1 0.6247 0.31);
    }
</style>
