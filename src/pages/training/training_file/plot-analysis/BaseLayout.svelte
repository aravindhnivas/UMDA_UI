<script lang="ts">
    import { current_post_analysis_files_directory, current_analysis_file } from './stores';
    import { Loadingbtn } from '$lib/components';
    import { ChartColumnBig } from 'lucide-svelte/icons';
    import CheckFileStatus from '../CheckFileStatus.svelte';

    export let name: AnalysisItemsType;
    export let hidden: boolean = false;

    const MolecularAnalysis = getContext<MolecularAnalysisFunction>('MolecularAnalysis');
    const dispatch = createEventDispatcher();

    const RunAnalysis = async (name: AnalysisItemsType) => {
        const analysis_file = await $current_analysis_file;
        if (!(await fs.exists(analysis_file))) {
            toast.error(`${analysis_file} file does not exist`);
            return;
        }

        const csv_filename = `${name}.csv`;
        if (await fs.exists(await path.join(await $current_post_analysis_files_directory, csv_filename))) {
            const overwrite = await dialog.confirm(
                `${csv_filename} file already exists. Do you want to overwrite it?`,
                'File exists',
            );
            if (!overwrite) {
                dispatch('plot');
                return;
            }
        }
        console.log('running', name);
        return await MolecularAnalysis(name);
    };

    let recheck_files = false;
    onMount(async () => {
        recheck_files = !recheck_files;
    });
</script>

<div class="grid gap-2 items-end" class:hidden>
    <div class="flex justify-between">
        <div class="flex gap-2 items-end">
            <Loadingbtn
                name="Run {name} analysis"
                callback={async () => await RunAnalysis(name)}
                subprocess={true}
                on:result={async () => {
                    recheck_files = !recheck_files;
                    dispatch('plot');
                }}
            />
            <button
                class="btn btn-sm btn-outline"
                on:click={() => {
                    recheck_files = !recheck_files;
                    dispatch('plot');
                }}
            >
                <span>Plot</span>
                <ChartColumnBig />
            </button>
        </div>
        <CheckFileStatus name={name + '.csv'} bind:recheck_files />
    </div>
    <slot />
</div>
