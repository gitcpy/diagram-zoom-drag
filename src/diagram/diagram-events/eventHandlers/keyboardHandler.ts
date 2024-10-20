import DiagramEvents from '../diagram-events';

export class KeyboardHandler {
    constructor(private readonly diagramEvents: DiagramEvents) {}

    /**
     * Initializes the keyboard event handler for the given container element.
     *
     * This method adds a keydown event listener to the given container element.
     * When a keydown event occurs, the method {@link keyDown} is called with the
     * container and the event as arguments.
     *
     * @param container - The container element to add the keydown event listener to.
     */
    initialize(container: HTMLElement): void {
        if (!this.diagramEvents.diagram.plugin.view) {
            return;
        }

        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'keydown',
            this.keyDown.bind(this, container)
        );
    }

    /**
     * Handles key events for the diagram element.
     * If the key pressed is within the allowed keys, it performs specific actions based on the key.
     *
     * @param container - The container element where the key event occurred.
     * @param event - The keyboard event that triggered the function.
     */
    keyDown(container: HTMLElement, event: KeyboardEvent): void {
        const key = event.code;
        const KEYS = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Equal',
            'Minus',
            'Digit0',
        ];
        if (!KEYS.includes(key)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.diagramEvents.diagram.activeContainer = container;

        switch (key) {
            case 'ArrowUp':
                this.diagramEvents.diagram.diagramActions.moveElement(
                    container,
                    0,
                    50,
                    true
                );
                break;
            case 'ArrowDown':
                this.diagramEvents.diagram.diagramActions.moveElement(
                    container,
                    0,
                    -50,
                    true
                );
                break;
            case 'ArrowLeft':
                this.diagramEvents.diagram.diagramActions.moveElement(
                    container,
                    50,
                    0,
                    true
                );
                break;
            case 'ArrowRight':
                this.diagramEvents.diagram.diagramActions.moveElement(
                    container,
                    -50,
                    0,
                    true
                );
                break;
        }

        if (event.ctrlKey) {
            switch (key) {
                case 'Equal':
                    this.diagramEvents.diagram.diagramActions.zoomElement(
                        container,
                        1.1,
                        true
                    );
                    break;
                case 'Minus':
                    this.diagramEvents.diagram.diagramActions.zoomElement(
                        container,
                        0.9,
                        true
                    );
                    break;
                case 'Digit0':
                    this.diagramEvents.diagram.diagramActions.resetZoomAndMove(
                        container,
                        true
                    );
                    break;
            }
        }
    }
}
