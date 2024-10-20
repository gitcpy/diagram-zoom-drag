import { updateButton } from '../../../helpers/helpers';

export class Folding {
    /**
     * Observes the given container element for changes to its 'class'
     * attribute. When the 'class' attribute changes, the
     * `handleClassChange` method is called with the container element and the
     * relevant MutationRecord.
     *
     * @param container - The container element to observe.
     */
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

    /**
     * Handles changes to the 'class' attribute of the given container element.
     *
     * If the container element's 'class' attribute changes to include or remove
     * the 'folded' class, the following actions are taken:
     * - All child elements of the container with class 'mermaid-zoom-drag-panel'
     *   and without class 'diagram-fold-panel' will have their 'hidden' and
     *   'visible' classes toggled.
     * - The element with id 'diagram-fold-button' inside the container element
     *   will have its icon and tooltip text updated.
     *
     * @param container - The container element that was observed by the
     * MutationObserver.
     * @param mutation - The MutationRecord that triggered this method call.
     */
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
                panel.toggleClass('hidden', isFolded);
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
