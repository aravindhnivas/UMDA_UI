<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';

    export let title: string = 'Window';
    export let width: number = 300;
    export let height: number = 200;
    export let x: number = 20;
    export let y: number = 20;
    export let minWidth: number = 200;
    export let minHeight: number = 100;

    let isMoving: boolean = false;
    let startX: number, startY: number, startMouseX: number, startMouseY: number;
    let isResizing: boolean = false;
    let startWidth: number, startHeight: number;
    let zIndex: number = 1;
    let isMaximized: boolean = false;
    let isMinimized: boolean = false;
    let previousState: { width: number; height: number; x: number; y: number } | null = null;

    const dispatch = createEventDispatcher();

    function startMove(e: MouseEvent): void {
        if (isMaximized) return;
        isMoving = true;
        startX = x;
        startY = y;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        zIndex++;
        dispatch('focus');
    }

    function startResize(e: MouseEvent): void {
        if (isMaximized) return;
        isResizing = true;
        startWidth = width;
        startHeight = height;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        zIndex++;
        dispatch('focus');
    }

    function restoreFromMaximized(): void {
        if (isMaximized && previousState) {
            isMaximized = false;
            ({ width, height, x, y } = previousState);
        }
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape' && isMaximized) {
            restoreFromMaximized();
        }
    }

    function handleMouseMove(e: MouseEvent): void {
        if (isMoving) {
            x = startX + e.clientX - startMouseX;
            y = startY + e.clientY - startMouseY;
        } else if (isResizing) {
            width = Math.max(minWidth, startWidth + e.clientX - startMouseX);
            height = Math.max(minHeight, startHeight + e.clientY - startMouseY);
        }
    }

    function handleMouseUp(): void {
        isMoving = false;
        isResizing = false;
    }

    function minimize(): void {
        if (!isMinimized) {
            previousState = { width, height, x, y };
            isMinimized = true;
            isMaximized = false;
            height = 30; // Height of the title bar
        } else {
            isMinimized = false;
            if (previousState) {
                ({ width, height, x, y } = previousState);
            }
        }
    }

    function maximize(): void {
        if (!isMaximized) {
            previousState = { width, height, x, y };
            isMaximized = true;
            isMinimized = false;
            x = 0;
            y = 0;
            width = window.innerWidth;
            height = window.innerHeight;
        } else {
            restoreFromMaximized();
        }
    }

    onMount(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleKeydown);
        };
    });

    let showWindow = true;
    export function handleClose(): void {
        showWindow = false;
        dispatch('close');
    }
</script>

{#if showWindow}
    <div
        class="floating-window"
        class:maximized={isMaximized}
        class:minimized={isMinimized}
        style="width: {width}px; height: {height}px; left: {x}px; top: {y}px; z-index: {zIndex};"
    >
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="title-bar" on:mousedown={startMove}>
            <span>{title}</span>
            <div class="window-controls">
                <button class="minimize" on:click={minimize}>&#8212;</button>
                <button class="maximize" on:click={maximize}>&#9633;</button>
                <button class="close" on:click={handleClose}>&#10005;</button>
            </div>
        </div>
        <div class="content" class:hidden={isMinimized}>
            <slot></slot>
        </div>
        {#if !isMaximized && !isMinimized}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="resize-handle" on:mousedown={startResize}></div>
        {/if}
    </div>
{/if}

<style>
    .floating-window {
        position: absolute;
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .maximized {
        border: none;
        box-shadow: none;
    }

    .minimized {
        height: 30px !important;
        overflow: hidden;
    }

    .title-bar {
        background-color: #f0f0f0;
        padding: 5px 10px;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 30px;
    }

    .content {
        flex-grow: 1;
        overflow: auto;
        padding: 10px;
    }

    .hidden {
        display: none;
    }

    .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        cursor: se-resize;
    }

    .window-controls {
        display: flex;
    }

    .window-controls button {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .window-controls button:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .minimize {
        font-size: 12px;
    }

    .close:hover {
        background-color: #e81123 !important;
        color: white;
    }
</style>
