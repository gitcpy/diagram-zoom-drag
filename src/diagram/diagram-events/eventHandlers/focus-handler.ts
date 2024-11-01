import DiagramEvents from '../diagram-events';

export class FocusHandler {
    constructor(private readonly diagramEvents: DiagramEvents) {}

    /**
     * Adds focus event listeners to the given container element.
     *
     * This function adds the following event listeners to the given container element:
     * - `focusin`: Handles the focus in event for the container element.
     * - `focusout`: Handles the focus out event for the container element.
     *
     * @param container - The container element to add the focus event listeners to.
     */
    initialize(container: HTMLElement): void {
        if (!this.diagramEvents.diagram.plugin.view) {
            return;
        }

        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'focusin',
            this.focusIn.bind(this, container)
        );

        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'focusout',
            this.focusOut.bind(this, container)
        );
    }

    /**
     * Handles the focus in event for the container element.
     * If automatic folding on focus change is enabled in the diagram plugin settings,
     * the 'folded' class is removed from the container element.
     * The active container is set to the given container.
     *
     * @param container - The container element where the focus in event occurred.
     */
    private focusIn(container: HTMLElement): void {
        if (
            this.diagramEvents.diagram.plugin.settings
                .automaticCollapsingOnFocusChange
        ) {
            container.removeClass('folded');
        }
        this.diagramEvents.diagram.activeContainer = container;
    }

    /**
     * Handles the focus out event for the container element.
     * If automatic folding on focus change is enabled in the diagram plugin settings,
     * the 'folded' class is added to the container element.
     *
     * @param container - The container element where the focus out event occurred.
     */
    private focusOut(container: HTMLElement): void {
        if (
            this.diagramEvents.diagram.plugin.settings
                .automaticCollapsingOnFocusChange
        ) {
            container.addClass('folded');
        }
    }
}
