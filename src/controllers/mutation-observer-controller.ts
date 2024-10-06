import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { setIcon } from 'obsidian';

export default class MutationObserverController {
    constructor(public plugin: DiagramZoomDragPlugin) {}

    addFoldingObserver(container: HTMLElement): void {
        const foldingObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'class'
                ) {
                    const target = mutation.target as HTMLElement;
                    const wasFolded = (mutation.oldValue ?? '').includes(
                        'folded'
                    );
                    const isFolded = target.classList.contains('folded');

                    if (wasFolded !== isFolded) {
                        const panels: NodeListOf<HTMLElement> =
                            container.querySelectorAll(
                                '.mermaid-zoom-drag-panel:not(.diagram-fold-panel)'
                            );
                        panels.forEach((panel) => {
                            if (isFolded) {
                                panel.addClass('hidden');
                                panel.removeClass('visible');
                            } else {
                                panel.addClass('visible');
                                panel.removeClass('hidden');
                            }
                        });

                        const button: HTMLElement | null =
                            container.querySelector('#diagram-fold-button');
                        if (button) {
                            setIcon(
                                button,
                                isFolded ? 'unfold-vertical' : 'fold-vertical'
                            );
                            button.ariaLabel = isFolded
                                ? 'Expand diagram'
                                : 'Fold diagram';
                        }
                    }
                }
            });
        });
        foldingObserver.observe(container, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['class'],
        });
    }
}
