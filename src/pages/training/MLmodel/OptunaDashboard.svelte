<script lang="ts">
    import { Alert } from '$utils/stores';
    import { WebviewWindow } from '@tauri-apps/api/window';

    let webview: WebviewWindow;
    const open_dashboard = () => {
        webview = new WebviewWindow('optuna-dashboard', {
            title: 'Optuna Dashboard',
            url: 'http://localhost:8080',
        });
        webview.once('tauri://created', function () {
            toast.info('webview window successfully created');
        });
        webview.once('tauri://error', function (e) {
            console.error('an error occurred during webview window creation');
            Alert.error(e);
        });
        webview.once('tauri://destroyed', function () {
            toast.warning('webview window successfully destroyed');
        });
    };

    onDestroy(async () => {
        if (webview) {
            await webview.close();
            toast.warning('webview window successfully closed');
        }
    });
</script>

<button class="btn btn-sm btn-primary" on:click={open_dashboard}>Open optuna-dashboard</button>
