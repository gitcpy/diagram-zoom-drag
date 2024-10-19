import { updateButton } from '../../../helpers/helpers';

export class Folding {
    observe(container: HTMLElement): void {
        const foldingObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'class'
                ) {
                    this.handleClassChange(container, mutation);
                }
            });
        });
        foldingObserver.observe(container, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['class'],
        });
    }

    private handleClassChange(
        container: HTMLElement,
        mutation: MutationRecord
    ): void {
        const target = mutation.target as HTMLElement;
        const wasFolded = (mutation.oldValue ?? '').includes('folded');
        const isFolded = target.hasClass('folded');

        if (wasFolded !== isFolded) {
            const panels: NodeListOf<HTMLElement> = container.querySelectorAll(
                '.mermaid-zoom-drag-panel:not(.diagram-fold-panel)'
            );
            panels.forEach((panel) => {
                // if is folded, then add `hidden` class, otherwise remove `hidden` class
                panel.toggleClass('hidden', isFolded);
                // if is folded, then remove `visible` class, otherwise add `visible` class
                panel.toggleClass('visible', !isFolded);
            });

            const button: HTMLElement | null = container.querySelector(
                '#diagram-fold-button'
            );
            if (button) {
                updateButton(
                    button,
                    isFolded ? 'unfold-vertical' : 'fold-vertical',
                    isFolded ? 'Expand diagram' : 'Fold diagram'
                );
            }
        }
    }
}
