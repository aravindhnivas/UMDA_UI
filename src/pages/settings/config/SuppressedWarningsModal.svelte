<script lang="ts">
    import Modal from '$lib/components/modal/Modal.svelte';
    import { typeSafeObjectKeys } from '$lib/utils';
    import { suppressed_warnings } from '$lib/pyserver/stores';
</script>

<Modal title="Supressed warnings" label="Show Warnings" open={true}>
    <div class="grid gap-2">
        {#each typeSafeObjectKeys($suppressed_warnings) as pyfile}
            <div class="grid gap-2">
                <div class="collapse collapse-arrow bg-base-200" style="background-color: #d2ccd2;">
                    <input type="radio" name="my-accordion-1" checked={true} />
                    <div class="collapse-title text-xl font-medium">{pyfile}</div>
                    <div class="collapse-content">
                        <div class="grid gap-2">
                            {#each $suppressed_warnings[pyfile] as { timestamp, warnings }}
                                <div class="grid gap-2">
                                    <div class="collapse collapse-arrow bg-base-200">
                                        <input type="radio" name="my-accordion-2" checked={true} />
                                        <div class="collapse-title text-xl font-medium">{timestamp}</div>
                                        <div class="collapse-content">
                                            <p class="text-sm font-400">
                                                {#each warnings as w, ind}
                                                    {ind + 1}. {w}
                                                    {#if ind < warnings.length - 1}
                                                        <br />
                                                    {/if}
                                                {/each}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</Modal>
