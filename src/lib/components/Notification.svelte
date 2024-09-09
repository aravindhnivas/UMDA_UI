<script lang="ts">
    import { CircleX, Info, TriangleAlert, CheckCheck, Eye } from 'lucide-svelte/icons';
    export let message: string;
    export let type: 'info' | 'success' | 'warning' | 'error' = 'error';

    let dialog_element: HTMLDialogElement;
    let dismiss = false;
    const alert_classes = {
        info: 'p-4 mb-4 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800',
        success:
            'p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800',
        warning:
            'p-4 mb-4 text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800',
        error: 'p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800',
    };
</script>

{#if !dismiss}
    <div class={alert_classes[type]} role="alert">
        <div class="flex items-center gap-2">
            {#if type === 'info'}
                <Info />
                <span class="sr-only">Info</span>
                <h3 class="text-lg font-medium">Information</h3>
            {:else if type === 'success'}
                <CheckCheck />
                <span class="sr-only">Success</span>
                <h3 class="text-lg font-medium">Success</h3>
            {:else if type === 'warning'}
                <TriangleAlert />
                <span class="sr-only">Warning</span>
                <h3 class="text-lg font-medium">Warning</h3>
            {:else if type === 'error'}
                <CircleX />
                <span class="sr-only">Error</span>
                <h3 class="text-lg font-medium">Error</h3>
            {/if}
        </div>
        <div class="mt-2 mb-4 text-sm">
            {message}
        </div>

        <div class="flex gap-2">
            {#if $$slots.more_details}
                <button type="button" class="btn btn-xs btn-info" on:click={() => dialog_element?.showModal()}>
                    <Eye />
                    View more
                </button>
            {/if}
            <button type="button" class="btn btn-xs btn-error" on:click={() => (dismiss = true)}> Dismiss </button>
        </div>
    </div>

    <dialog bind:this={dialog_element} class="modal">
        <div class="modal-box w-11/12 max-w-5xl {alert_classes[type]}">
            <h3 class="text-lg font-bold">More details</h3>
            <p class="py-4">
                <slot name="more_details" />
            </p>
            <div class="modal-action">
                <form method="dialog">
                    <button class="btn btn-sm">Close</button>
                </form>
            </div>
        </div>
    </dialog>
{/if}
