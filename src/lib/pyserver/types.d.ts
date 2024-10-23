type JobStatusType = {
    status: 'queued' | 'running' | 'error' | 'completed';
    result: Record<string, any>;
};
