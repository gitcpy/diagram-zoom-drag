import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { setIcon } from 'obsidian';
import { ContainerID } from '../typing/typing';

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
                    const wasFolded = (mutation.oldValue || '').includes(
                        'folded'
                    );
                    const isFolded = target.classList.contains('folded');

                    if (wasFolded !== isFolded) {
                        const panels = container.querySelectorAll(
                            '.hide-when-parent-folded'
                        );
                        panels.forEach((panel) => {
                            const html = panel as HTMLElement;
                            html.style.visibility = isFolded
                                ? 'hidden'
                                : 'visible';
                        });
                        const button = container.querySelector(
                            '#diagram-fold-button'
                        ) as HTMLElement | null;
                        if (button) {
                            setIcon(button, isFolded ? 'minus' : 'plus');
                            button.ariaLabel = isFolded
                                ? 'Unfold diagram'
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
