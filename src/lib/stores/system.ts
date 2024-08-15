export const RAM_SIZE = writable(0);
export const CPU_COUNT = writable(0);
export const MAX_CPU = derived(CPU_COUNT, $CPU_COUNT => Math.floor($CPU_COUNT * 0.7));
export const default_cpu_count = derived(CPU_COUNT, $CPU_COUNT => Math.floor($CPU_COUNT * 0.5));
export const NPARTITIONS = writable(50);
export const use_dask = localWritable('use_dask', false);
