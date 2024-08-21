<script lang="ts">
    import { post_analysis_files_directory } from './stores';
    import { Loadingbtn } from '$lib/components';
    import { ChartColumnBig } from 'lucide-svelte';
    import CheckFileStatus from '../CheckFileStatus.svelte';
    import { molecule_analysis_filename } from '../stores';

    export let name: AnalysisItemsType;
    export let hidden: boolean = false;

    const MolecularAnalysis = getContext<MolecularAnalysisFunction>('MolecularAnalysis');
    const dispatch = createEventDispatcher();

    const RunAnalysis = async (name: AnalysisItemsType) => {
        if (!(await fs.exists($molecule_analysis_filename))) {
            toast.error(`${$molecule_analysis_filename} file does not exist`);
            return;
        }

        const csv_file = `${name}.csv`;
        if (await fs.exists(await path.join(await $post_analysis_files_directory, csv_file))) {
            const overwrite = await dialog.confirm(
                `${csv_file} file already exists. Do you want to overwrite it?`,
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
                name="Run analysis"
                callback={async () => await RunAnalysis(name)}
                subprocess={true}
                on:result={async () => {
                    recheck_files = !recheck_files;
                    dispatch('plot');
                }}
            />
            <button class=" btn btn-sm" on:click={() => dispatch('plot')}>
                <span>Plot</span>
                <ChartColumnBig />
            </button>
        </div>
        <CheckFileStatus name={name + '.csv'} bind:recheck_files />
    </div>
    <slot />
</div>
