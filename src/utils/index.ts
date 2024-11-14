export const toggle_loading = (node: HTMLButtonElement, className = 'running') => {
    if (!node) return;
    if (node.classList.contains(className)) {
        node.classList.remove(className);
        node.disabled = false;
    } else {
        node.classList.add(className);
        node.disabled = true;
    }
};
console.log('Utilities loaded');
