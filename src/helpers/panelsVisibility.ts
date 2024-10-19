export const panelsMap = new WeakMap<HTMLElement, NodeListOf<HTMLElement>>();

export function initializePanelsStorage(container: HTMLElement) {
    panelsMap.set(
        container,
        container.querySelectorAll(
            '.mermaid-zoom-drag-panel:not(.diagram-fold-panel)'
        )
    );
}

export function showPanels(container: HTMLElement) {
    const panels = panelsMap.get(container);
    if (panels) {
        panels.forEach((panel) => {
            panel.removeClass('hidden');
            panel.addClass('visible');
        });
    }
}

export function hidePanels(container: HTMLElement) {
    const panels = panelsMap.get(container);
    if (panels) {
        panels.forEach((panel) => {
            panel.removeClass('visible');
            panel.addClass('hidden');
        });
    }
}
