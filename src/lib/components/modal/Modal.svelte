<script context="module" lang="ts">
    import { writable } from 'svelte/store';
    export const MODAL_ID = 'umdaui_modal';
    export const MODAL = writable({
        open: () => {
            const modal = document.getElementById(MODAL_ID) as HTMLDialogElement;
            if (modal) modal.showModal();
        },
    });
</script>

<script lang="ts">
    export let id: string = 'umdaui_modal';
</script>

<!-- Open the modal using ID.showModal() method -->
<!-- <button class="btn" onclick="my_modal_1.showModal()">open modal</button> -->
<dialog {id} class="modal">
    <div class="modal-box">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Hello!</h3>
        <p class="py-4">Press ESC key or click on ✕ button to close</p>
    </div>
</dialog>
