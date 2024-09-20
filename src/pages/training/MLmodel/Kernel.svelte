<script lang="ts">
    import { PlusCircle, Trash2 } from 'lucide-svelte/icons';
    import { difference } from 'lodash-es';
    import CustomInput from '$lib/components/CustomInput.svelte';

    export let value: Record<string, any> | null = null;

    const default_value = {
        Constant: {
            constant_value: '1',
            constant_value_bounds: '1e-5, 1e5',
        },
        RBF: {
            length_scale: '1',
            length_scale_bounds: '1e-5, 1e5',
        },
        Matern: {
            length_scale: '1',
            nu: '1',
            length_scale_bounds: '1e-5, 1e5',
        },
        RationalQuadratic: {
            length_scale: '1',
            alpha: '1',
            length_scale_bounds: '1e-5, 1e5',
            alpha_bounds: '1e-5, 1e5',
        },
        ExpSineSquared: {
            length_scale: '1',
            periodicity: '1',
            length_scale_bounds: '1e-5, 1e5',
            periodicity_bounds: '1e-5, 1e5',
        },
        DotProduct: {
            sigma_0: '1',
            sigma_0_bounds: '1e-5, 1e5',
        },
        WhiteKernel: {
            noise_level: '1',
            noise_level_bounds: '1e-5, 1e5',
        },
    };

    const kernel_values = [
        'Constant',
        'RBF',
        'Matern',
        'RationalQuadratic',
        'ExpSineSquared',
        'DotProduct',
        'WhiteKernel',
    ];
    // $: console.log(value);
</script>

{#if value === null}
    <CustomInput disabled label="kernel" value="" helper="Default: None" />
{:else if typeof value === 'object' && !isEmpty(value)}
    <span>Custom kernel</span>
    {#each Object.keys(value) as kernel (kernel)}
        <div class="grid grid-cols-5 gap-2 items-end">
            <span>{kernel}</span>
            <div class="flex flex-wrap gap-2 col-span-3">
                {#each Object.keys(value[kernel]) as item}
                    <CustomInput label={item} bind:value={value[kernel][item]} />
                {/each}
            </div>
            <button
                class="btn btn-sm btn-error w-max"
                on:click={() => {
                    if (!value) return;
                    delete value[kernel];
                    value = value;
                    if (isEmpty(value)) value = null;
                }}><Trash2 /> REMOVE</button
            >
        </div>
        <hr />
    {:else}
        <div class="grid">
            <div class="text-xs col-span-2">kernel</div>
            <input
                class="input input-sm w-max"
                value=""
                disabled
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
            />
        </div>
        <CustomInput label="kernel" value="" />
    {/each}
{/if}
<button
    class="btn btn-sm w-max my-2"
    on:click={() => {
        if (value === null) {
            value = {
                Constant: default_value.Constant,
                RBF: default_value.RBF,
            };
            return;
        }
        const kernels = Object.keys(value);
        const diff = difference(kernel_values, kernels);
        if (diff.length < 1) return toast.info('All kernels added');
        value[diff[0]] = default_value[diff[0]];
    }}><PlusCircle /> ADD Kernel</button
>
