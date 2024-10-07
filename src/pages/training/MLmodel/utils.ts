import { all_params_lock_status, model, fine_tuned_values } from './stores';

export function parse_fine_tuned_values() {
    let clonedFineTunedValues: Record<string, any> = {};
    const $fine_tuned_values = get(fine_tuned_values);
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
