<script lang="ts">
    import { WebviewWindow } from '@tauri-apps/api/window';

    let webview: WebviewWindow;
    const open_dashboard = () => {
        webview = new WebviewWindow('optuna-dashboard', {
            url: 'http://localhost:8080',
        });
        console.log(webview);
        // since the webview window is created asynchronously,
        // Tauri emits the `tauri://created` and `tauri://error` to notify you of the creation response
        webview.once('tauri://created', function () {
            console.warn('webview window successfully created');
        });
        webview.once('tauri://error', function (e) {
            console.error('an error occurred during webview window creation');
            console.error(e);
        });
        webview.once('tauri://destroyed', function () {
            console.warn('webview window successfully destroyed');
        });
    };

    onDestroy(async () => {
        if (webview) {
            await webview.close();
        }
    });
</script>

<button class="btn btn-sm btn-primary" on:click={open_dashboard}>Open optuna-dashboard</button>
