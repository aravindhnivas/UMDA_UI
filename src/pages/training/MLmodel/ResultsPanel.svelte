<script lang="ts">
    import {
        current_pretrained_file,
        include_training_file_in_plot,
        learning_curve,
        model,
        model_names,
        plot_data,
        results,
        current_model_pkl_files,
    } from './stores';
    import Checkbox from '$lib/components/Checkbox.svelte';
    import CustomPanel from '$lib/components/CustomPanel.svelte';
    import { PlotlyColors } from '$lib/utils';
    import { CheckCheck, ExternalLink } from 'lucide-svelte/icons';
    import { CustomInput } from '$lib/components';
    import ResultsStats from './results-subcomponents/ResultsStats.svelte';
    import CustomSelect from '$lib/components/CustomSelect.svelte';
    import FileExists from '$lib/components/FileExists.svelte';
    import { RefreshCcw } from 'lucide-svelte/icons';
    import CustomTabs from '$lib/components/CustomTabs.svelte';
    import { current_training_processed_data_directory, ROOT_DIR } from '../training_file/plot-analysis/stores';
    import ResultsPlots from './results-subcomponents/ResultsPlots.svelte';
    import OptunaGridPlots from './results-subcomponents/OptunaGridPlots.svelte';
    import MetricsTable from './results-subcomponents/MetricsTable.svelte';

    export let data_file: string;
    export let plot_data_ready = false;

    interface ParsedData {
        test: {
            y_true: number[];
            y_pred: number[];
            y_linear_fit: number[];
        };
        train: {
            y_true: number[];
            y_pred: number[];
            y_linear_fit: number[];
        };
    }

    let test_data = {} as Record<MLModel, ParsedData['test']>;
    let train_data = {} as Record<MLModel, ParsedData['train']>;

    const on_plot_data_ready = async (datfile: string) => {
        try {
            const filename = await path.basename(datfile);
            const file_model = filename.split('_')[0] as MLModel;
            $model = file_model;
            console.log('Reading plot data\n', filename, file_model, $model);

            const saved_file_contents = await fs.readTextFile(datfile);
            const parsed = JSON.parse(saved_file_contents) as ParsedData;
            console.warn({ parsed });

            test_data[$model] = parsed.test;
            train_data[$model] = parsed.train;

            if (!(test_data[$model] && train_data[$model])) {
                toast.error('Error reading plot data');
                return;
            }

            $plot_data[$model] = [
                {
                    x: test_data[$model].y_true,
                    y: test_data[$model].y_pred,
                    mode: 'markers',
                    type: 'scattergl',
                    name: 'TEST: Predicted',
                    marker: { color: PlotlyColors.muted_blue },
                },
                {
                    x: test_data[$model].y_true,
                    y: test_data[$model].y_linear_fit,
                    mode: 'lines',
                    type: 'scattergl',
                    name: 'TEST: fit',
                    line: { color: PlotlyColors.muted_blue },
                },
            ];
            if ($include_training_file_in_plot) {
                $plot_data[$model] = [
                    {
                        x: train_data[$model].y_true,
                        y: train_data[$model].y_pred,
                        mode: 'markers',
                        type: 'scattergl',
                        name: 'TRAIN: Predicted',
                        opacity: 0.5,
                        marker: { color: PlotlyColors.safety_orange },
                    },
                    {
                        x: train_data[$model].y_true,
                        y: train_data[$model].y_linear_fit,
                        mode: 'lines',
                        type: 'scattergl',
                        name: 'TRAIN: Linear fit',
                        line: { color: PlotlyColors.safety_orange },
                    },
                    ...$plot_data[$model],
                ];
            }

            const { learning_curve_file } = await get_pretrained_file($current_pretrained_file);
            if ($learning_curve.active) {
                await get_learning_curve_data(learning_curve_file);
            }
        } catch (error) {
            toast.error('Error reading plot data\n' + error);
        }
    };

    const include_training_plot_if_required = async () => {
        console.log('include_training_plot_if_required', $include_training_file_in_plot);
        console.log($plot_data[$model]);
        if (!$plot_data?.[$model]) return;

        if (!$plot_data[$model]?.length) {
            console.warn('No plot data found');
            return;
        }

        if (!(train_data[$model] && test_data[$model])) {
            console.log({ train_data, test_data, $model });
            console.warn('No training data found');
            return;
        }

        if ($plot_data[$model]?.some(d => d.name?.includes('TRAIN'))) {
            console.warn('Removing training data from plot');
            if ($include_training_file_in_plot) return;
            $plot_data[$model] = $plot_data[$model]?.filter(d => !d.name?.includes('TRAIN')) ?? [];
            console.log($plot_data[$model]);
            return;
        }
        console.log($plot_data[$model]);
        if (!$include_training_file_in_plot) return;
        console.warn('Adding training data to plot');
        $plot_data[$model] = [
            {
                x: train_data[$model].y_true,
                y: train_data[$model].y_pred,
                mode: 'markers',
                type: 'scattergl',
                name: 'TRAIN: Predicted',
                opacity: 0.5,
                marker: { color: PlotlyColors.safety_orange },
            },
            {
                x: train_data[$model].y_true,
                y: train_data[$model].y_linear_fit,
                mode: 'lines',
                type: 'scattergl',
                name: 'TRAIN: Linear fit',
                line: { color: PlotlyColors.safety_orange },
            },
            ...$plot_data[$model],
        ];

        console.log($plot_data[$model]);
    };

    const get_pretrained_file = async (name: Promise<string> | string) => {
        let pretrained_file = await name;

        console.log(pretrained_file);
        if (pretrained_file.endsWith('.pkl')) {
            pretrained_file = pretrained_file.replace('.pkl', '');
        }

        const datfile = pretrained_file + '.dat.json';
        const resultsfile = pretrained_file + '.results.json';
        const learning_curve_file = pretrained_file + '.learning_curve.json';
        const cv_scores_file = pretrained_file + '.cv_scores.json';
        return { datfile, resultsfile, learning_curve_file, cv_scores_file };
    };

    $: get_pretrained_file($current_pretrained_file);
    $: if (plot_data_ready && data_file) {
        on_plot_data_ready(data_file);
    }

    let current_dat_file: string = '';
    const plot_from_datfile = async (name: string | null = null) => {
        console.log('Plotting from datfile', name);
        let datfile, resultsfile, learning_curve_file, cv_scores_file;
        if (name) {
            const files = await get_pretrained_file(name);
            datfile = files.datfile;
            resultsfile = files.resultsfile;
            learning_curve_file = files.learning_curve_file;
            cv_scores_file = files.cv_scores_file;
        } else {
            const files = await get_pretrained_file($current_pretrained_file);
            datfile = files.datfile;
            resultsfile = files.resultsfile;
            learning_curve_file = files.learning_curve_file;
            cv_scores_file = files.cv_scores_file;
        }
        current_dat_file = await path.basename(datfile);
        await on_plot_data_ready(datfile);
        console.log('Reading results file', resultsfile);

        const parsed_results = await readJSON<MLResults>(resultsfile);
        if (!parsed_results) return;

        $results[$model] = parsed_results;
        if (await fs.exists(learning_curve_file)) {
            await get_learning_curve_data(learning_curve_file);
        }
        if (await fs.exists(cv_scores_file)) {
            await get_cv_scores(cv_scores_file);
        }
    };

    let cv_scores_data: Record<string, CVScoresData> = {};

    const get_cv_scores = async (filename: string) => {
        const data = await readJSON<Record<string, CVScoresData>>(filename);
        if (!data) return;

        cv_scores_data = data;

        const nfolds = Object.keys(cv_scores_data).map(Number);
        if (!nfolds.length) return;

        available_cv_folds = nfolds.map(String);
        const max_nfold = Math.max(...nfolds);
        current_cv_fold = String(max_nfold);

        // console.log({ cv_scores_data, nfolds, max_nfold });
        if (!$results?.[$model]) return;
        $results[$model].cv_fold = max_nfold;
        $results[$model].cv_scores = cv_scores_data[`${max_nfold}`];
    };

    const get_learning_curve_data = async (filename: string) => {
        const learningCurveData = await readJSON<LearningCurveData>(filename);
        if (!learningCurveData) return;

        // Prepare the data for plotting
        const { data } = learningCurveData;
        if (!data) return toast.error('No data found in learning curve file');

        let trainingSizes = Object.keys(data);

        const testScores = trainingSizes.map(size => data[size].test.mean);
        const testStd = trainingSizes.map(size => data[size].test.std);
        const trainScores = trainingSizes.map(size => data[size].train.mean);
        const trainStd = trainingSizes.map(size => data[size].train.std);

        const Nfold_CV = learningCurveData.CV;
        const x = trainingSizes.map(Number);

        const testTrace: Partial<Plotly.Data> = {
            x,
            y: testScores,
            error_y: {
                type: 'data',
                array: testStd,
                visible: true,
            },
            mode: 'lines+markers',
            name: 'Test',
            type: 'scatter',
        };

        const trainTrace: Partial<Plotly.Data> = {
            x,
            y: trainScores,
            error_y: {
                type: 'data',
                array: trainStd,
                visible: true,
            },
            mode: 'lines+markers',
            name: 'Train',
            type: 'scatter',
        };

        // Define the layout
        const layout: Partial<Plotly.Layout> = {
            title: 'Learning Curve',
            xaxis: {
                title: 'Training Data Size',
                tickmode: 'array',
                tickvals: x,
            },
            yaxis: {
                title: `R<sup>2</sup> - Score (${Nfold_CV}-fold CV)`,
            },
        };
        const learning_curve_plotly_data = { data: [trainTrace, testTrace], layout };
        if (!$results[$model]) return;
        $results[$model].learning_curve_plotly_data = learning_curve_plotly_data;
        return learning_curve_plotly_data;
    };

    let significant_digits = 2;
    $: if (significant_digits < 0) significant_digits = 0;
    $: if (significant_digits > 10) significant_digits = 10;
    let available_cv_folds: string[] = [];
    let current_cv_fold = '';

    let result_names = {} as Record<string, Record<string, { pkl: string; childrens: Record<string, any> }>>;

    const fetch_all_pkl_files = async (dir: string) => {
        if (!(await fs.exists(dir))) return [];
        const fname = await path.basename(dir);
        result_names[fname] = {};

        const getAllPklFiles = async (
            directory: string,
            parentName = '',
        ): Promise<Array<{ name: string; pkl_file: string }>> => {
            const files = await fs.readDir(directory);
            const results: Array<{ name: string; pkl_file: string }> = [];

            // Helper function to process a directory and find pkl files
            const processDirForPkl = async (dirPath: string, dirName: string) => {
                const contents = await fs.readDir(dirPath);

                if (!contents.some(f => f.name.endsWith('.results.json'))) return null;

                const datFile = contents.find(f => f.name.endsWith('.dat.json'))?.name;
                if (!datFile) return null;

                const pklFile = datFile.replace('.dat.json', '.pkl');
                return {
                    name: parentName ? `${parentName}: ${dirName}` : dirName,
                    pkl_file: await path.join(dirPath, pklFile),
                };
            };

            const searchSubdir = async (dirPath: string, name: string) => {
                let results = [] as Array<{ name: string; pkl_file: string }>;
                if (!(await fs.exists(dirPath))) return results;
                const subdirs = (await fs.readDir(dirPath)).filter(f => f.isDirectory);

                for (const subdir of subdirs) {
                    const subdirPath = await path.join(dirPath, subdir.name);
                    const subdirResult = await processDirForPkl(subdirPath, subdir.name);
                    if (subdirResult) {
                        results.push({
                            ...subdirResult,
                            name: `${name}: ${subdir.name}`,
                        });
                        // result_names[name][subdir.name] = {};
                        result_names[fname][name].childrens = {
                            ...result_names[fname][name].childrens,
                            [subdir.name]: {
                                pkl: subdirResult.pkl_file,
                                childrens: [],
                            },
                        };
                    }
                    const subsubdirs = (await fs.readDir(subdirPath)).filter(f => f.isDirectory);
                    for (const subsubdir of subsubdirs) {
                        const subsubdirPath = await path.join(subdirPath, subsubdir.name);
                        const subsubdirResult = await processDirForPkl(subsubdirPath, subsubdir.name);
                        if (subsubdirResult) {
                            results.push({
                                ...subsubdirResult,
                                name: `${name}: ${subdir.name}: ${subsubdir.name}`,
                            });
                            // result_names[name][subdir.name][subsubdir.name] = {};
                            result_names[fname][name].childrens[subdir.name].childrens = {
                                ...result_names[fname][name].childrens[subdir.name].childrens,
                                [subsubdir.name]: {
                                    pkl: subsubdirResult.pkl_file,
                                    childrens: [],
                                },
                            };
                        }
                    }
                }
                return results;
            };

            // Process each directory
            for (const entry of files.filter(f => f.isDirectory)) {
                const currentPath = await path.join(directory, entry.name);

                // Check main directory
                const mainDirResult = await processDirForPkl(currentPath, entry.name);
                if (mainDirResult) {
                    results.push(mainDirResult);

                    result_names[fname][entry.name] = {
                        ...result_names[fname][entry.name],
                        pkl: mainDirResult.pkl_file,
                        childrens: {},
                    };
                }

                // Check processed_subdirs if they exist
                const processedSubdirsPath = await path.join(currentPath, 'processed_subdirs');
                const subdir_results = await searchSubdir(processedSubdirsPath, entry.name);
                results.push(...subdir_results);
            }
            return results;
        };
        return getAllPklFiles(dir);
    };

    const get_valid_dirs = async (name: Promise<string>) => {
        const root_dir = await name;
        const model_dir = await path.join(root_dir, 'pretrained_models', $model);
        if (!(await fs.exists(model_dir))) return {};
        let all_pkl_files = {} as Record<string, { name: string; pkl_file: string }[]>;
        for (const child of (await fs.readDir(model_dir)).filter(f => f.isDirectory)) {
            if (!child.name.endsWith('_embeddings')) continue;
            const embeddings_dir = await path.join(model_dir, child.name);
            const pkl_files = await fetch_all_pkl_files(embeddings_dir);
            all_pkl_files[child.name.replace('_embeddings', '')] = pkl_files;
        }
        current_model_pkl_files.set(all_pkl_files);
        return result_names;
    };

    let reload_available_plots = false;
    let plotted_pkl_file = '';
    let show_plot = true;

    const tab_names = ['Plots', 'Metrics Table'];
    let active_tab = 'Plots';
    let plotted_dirname = '';
    const plot_from_pkl = async (pkl_file: string, name: string = '') => {
        plotted_dirname = name;
        plotted_pkl_file = pkl_file;
        await plot_from_datfile(pkl_file);
    };
</script>

<CustomPanel open={true} title="Results - {$model.toLocaleUpperCase()} Regressor">
    <div class="grid gap-2">
        <CustomTabs class="bordered" tabs={model_names.map(model => ({ tab: model }))} bind:active={$model} />
        {#await $current_pretrained_file then _}
            {#key plot_data_ready}
                <div class="grid gap-2" transition:fade>
                    <div role="tablist" class="tabs tabs-boxed w-max">
                        {#each tab_names as item}
                            <button
                                role="tab"
                                class="tab"
                                class:tab-active={item === active_tab}
                                on:click={() => (active_tab = item)}>{item}</button
                            >
                        {/each}
                    </div>

                    <div class="flex-gap my-2">
                        <button class="btn btn-sm" on:click={() => (reload_available_plots = !reload_available_plots)}>
                            <span>Reload</span>
                            <RefreshCcw size="20" />
                        </button>
                        <span>
                            All available plots for {$model.toLocaleUpperCase()} model. Click on the respective buttons to
                            plot.
                        </span>
                    </div>

                    {#key reload_available_plots}
                        {#await get_valid_dirs($current_training_processed_data_directory) then result_names}
                            <div>
                                {#each Object.entries(result_names) as [category, parents] (category)}
                                    {@const embedder = category.replace('_embeddings', '')}
                                    <div>
                                        <h2 class="text-xl font-semibold">
                                            {embedder} Plots ({$current_model_pkl_files[embedder].length})
                                        </h2>
                                        {#each Object.entries(parents) as [parent, parentData] (parentData.pkl)}
                                            {@const name = `${embedder}: ${parent}`}
                                            <div class="breadcrumbs text-sm">
                                                <ul>
                                                    <li>
                                                        ({$current_model_pkl_files[embedder].filter(f =>
                                                            f.name.startsWith(parent),
                                                        ).length})
                                                    </li>
                                                    <!-- Parent -->
                                                    <li>
                                                        <button
                                                            class="btn btn-xs btn-outline"
                                                            class:btn-active={plotted_pkl_file === parentData.pkl}
                                                            on:click={() => plot_from_pkl(parentData.pkl, name)}
                                                        >
                                                            {parent}
                                                        </button>
                                                    </li>

                                                    <!-- Children -->
                                                    {#if Object.keys(parentData.childrens).length > 0}
                                                        <li class="join">
                                                            {#each Object.entries(parentData.childrens) as [child, childData]}
                                                                {@const name = `${embedder}: ${parent}: ${child}`}
                                                                <button
                                                                    class="btn btn-xs btn-outline join-item"
                                                                    class:btn-active={plotted_pkl_file ===
                                                                        childData.pkl}
                                                                    on:click={() => plot_from_pkl(childData.pkl, name)}
                                                                >
                                                                    {child}
                                                                </button>
                                                            {/each}
                                                        </li>
                                                    {/if}

                                                    <!-- Grandchildren -->
                                                    {#each Object.entries(parentData.childrens) as [child, childData]}
                                                        {#if childData.childrens && Object.keys(childData.childrens).length > 0}
                                                            <li class="join">
                                                                {#each Object.entries(childData.childrens) as [grandchild, grandchildData]}
                                                                    {@const name = `${embedder}: ${parent}: ${child}: ${grandchild}`}
                                                                    <button
                                                                        class="btn btn-xs btn-outline join-item"
                                                                        class:btn-active={plotted_pkl_file ===
                                                                            grandchildData.pkl}
                                                                        on:click={() =>
                                                                            plot_from_pkl(grandchildData.pkl, name)}
                                                                    >
                                                                        {child}: {grandchild}
                                                                    </button>
                                                                {/each}
                                                            </li>
                                                        {/if}
                                                    {/each}
                                                </ul>
                                            </div>
                                        {/each}
                                    </div>
                                {/each}
                            </div>
                        {/await}
                    {/key}

                    <div class="flex my-2 gap-4 items-end">
                        <CustomInput
                            bind:value={significant_digits}
                            label="significant_digits"
                            type="number"
                            min="0"
                            max="10"
                        />
                        <CustomSelect
                            bind:value={current_cv_fold}
                            items={available_cv_folds}
                            label="CV Folds"
                            on:change={() => {
                                if (!$results?.[$model]) return;
                                $results[$model].cv_fold = Number(current_cv_fold);
                                $results[$model].cv_scores = cv_scores_data[current_cv_fold];
                            }}
                        />

                        <div class="flex-gap" class:hidden={active_tab !== 'Plots'}>
                            <Checkbox bind:value={show_plot} label="Show plots" />
                            <Checkbox
                                bind:value={$include_training_file_in_plot}
                                label="Plot training data"
                                on:change={include_training_plot_if_required}
                            />
                        </div>
                    </div>

                    {#if active_tab === 'Plots'}
                        {#await get_pretrained_file($current_pretrained_file) then { datfile }}
                            <FileExists name={datfile} let:basename={datfilename}>
                                <div class="grid grid-cols-[4fr_1fr] items-center gap-4">
                                    <div class="alert text-sm alert-success p-1">
                                        <CheckCheck />
                                        <span>
                                            Locally saved computed results are available to plot ({current_dat_file ||
                                                datfilename})
                                        </span>
                                    </div>
                                    <button
                                        class="btn btn-sm btn-outline"
                                        on:click={async () => {
                                            plotted_pkl_file = '';
                                            plotted_dirname = '';
                                            await plot_from_datfile();
                                        }}>Current plot</button
                                    >
                                </div>
                                <svelte:fragment slot="else">
                                    <div class="alert text-sm alert-warning p-1">
                                        <span>Locally saved computed results are not available to plot</span>
                                    </div>
                                </svelte:fragment>
                            </FileExists>
                        {/await}
                    {/if}

                    <div class="grid gap-2">
                        <ResultsStats {significant_digits} />
                    </div>

                    {#if plotted_pkl_file}
                        <span class="badge">{plotted_dirname}</span>
                        <div class="grid grid-cols-[1fr_auto] gap-1 items-center">
                            <span class="alert p-1 text-sm text-wrap break-all my-1">
                                ...{plotted_pkl_file.replace($ROOT_DIR + path.sep(), '')}
                            </span>
                            <button
                                class="btn btn-sm btn-outline"
                                on:click={async () => {
                                    await shell.open(await path.dirname(plotted_pkl_file));
                                }}
                            >
                                <span>Open folder</span>
                                <ExternalLink size="20" />
                            </button>
                        </div>
                    {/if}
                </div>

                <div class="grid gap-2" class:hidden={active_tab !== 'Plots'} transition:fade>
                    {#if show_plot}
                        <ResultsPlots />
                    {/if}
                    <OptunaGridPlots />
                </div>
                <div class="grid gap-2" class:hidden={active_tab !== 'Metrics Table'} transition:fade>
                    <MetricsTable />
                </div>
            {/key}
        {/await}
    </div>
</CustomPanel>
