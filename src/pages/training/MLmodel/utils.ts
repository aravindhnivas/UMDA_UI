import { all_params_lock_status, model, fine_tuned_values, default_fine_tuned_values } from './stores';
// import { parquetRead } from 'hyparquet';
// let reading_parquet = false;
// const read_parquet = async (filename: string) => {
//     if (!(await fs.exists(filename))) {
//         toast.error('File does not exist');
//         return;
//     }
//     reading_parquet = true;
//     const buffer = await fs.readFile(filename);
//     const arrayBuffer = new Uint8Array(buffer).buffer;

//     if (arrayBuffer.byteLength === 0) {
//         toast.error('Empty file');
//         reading_parquet = false;
//         return;
//     }
//     await parquetRead({
//         file: arrayBuffer,
//         onComplete: data => {
//             // console.log(data);
//             console.log('File read successfully', data.length, data[0]);
//             reading_parquet = false;
//         },
//     });
// };

export function parse_fine_tuned_values() {
    let clonedFineTunedValues: Record<string, any> = {};
    const $fine_tuned_values = get(fine_tuned_values);
    if (!$fine_tuned_values) {
        toast.error('Error parsing fine tuned values');
        return clonedFineTunedValues;
    }

    const $model = get(model);
    const $all_params_lock_status = get(all_params_lock_status);

    const v = ['hyperparameters', 'parameters'] as const;

    v.forEach(key => {
        const cloned_obj = structuredClone($fine_tuned_values[$model][key]);

        Object.keys(cloned_obj).forEach(label => {
            if ($all_params_lock_status[$model][key][label]) return;
            if (!cloned_obj[label]) return;

            const { active, value, type, scale } = cloned_obj[label];
            if (!(active && value)) return;
            const tuned_val = value.split(',').map(f => {
                f = f.trim();
                try {
                    if (f === 'true' || f === 'false' || f === 'null') return JSON.parse(f);
                    if (f === 'None') return null;
                    // if (!isNaN(Number(f))) return Number(f);
                    return f;
                } catch (error) {
                    console.error('Error parsing', f, error);
                }
            });
            if (tuned_val.length < 2) {
                toast.error(`Skipped: Fine tuned hyperparameter '${label}' must have at least 2 values`);
                return;
            }
            clonedFineTunedValues[label] = {
                value: tuned_val,
                type,
                scale,
            };
            console.log(label, cloned_obj[label], clonedFineTunedValues[label]);
        });
    });

    return clonedFineTunedValues;
}

export function set_default_fine_tuned_values(
    mode: 'hyperparameters' | 'parameters' | 'all' = 'all',
    model_name: MLModel,
) {
    const $default_fine_tuned_values = get(default_fine_tuned_values);
    // console.warn('set_default_fine_tuned_values', mode, model_name, $default_fine_tuned_values);
    // const $model = get(model);

    const v = ['hyperparameters', 'parameters'] as const;
    const for_key = (key: (typeof v)[number]) => {
        if (!$default_fine_tuned_values[model_name]) return;
        const cloned_obj = structuredClone($default_fine_tuned_values[model_name][key]);
        Object.entries(cloned_obj).forEach(([label, cloned]) => {
            fine_tuned_values.update(f => {
                f[model_name][key][label] = {
                    value: cloned.value,
                    type: cloned.type,
                    scale: cloned.scale,
                    active: false,
                };
                return f;
            });
        });
    };

    if (mode === 'all') v.forEach(for_key);
    else for_key(mode);
}
