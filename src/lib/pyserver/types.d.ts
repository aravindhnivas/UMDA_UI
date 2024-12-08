type JobStatusType = {
    status: 'queued' | 'running' | 'error' | 'completed' | 'cancelled';
    result: Record<string, any>;
};
