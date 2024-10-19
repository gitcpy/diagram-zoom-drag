import DiagramEvents from '../diagram-events';

export class KeyboardHandler {
    constructor(private readonly diagramEvents: DiagramEvents) {}

    initializeKeyboardEvents(container: HTMLElement): void {
        if (!this.diagramEvents.diagram.plugin.view) {
            return;
        }

        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'keydown',
            this.keyDown.bind(this, container)
        );
    }

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
