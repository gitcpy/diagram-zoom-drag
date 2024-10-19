import { Diagram } from '../diagram';
import { MouseHandler } from './eventHandlers/mouseHandler';
import { TouchHandler } from './eventHandlers/touchHandler';
import { KeyboardHandler } from './eventHandlers/keyboardHandler';
import { Folding } from './observers/folding';

export default class DiagramEvents {
    mouse: MouseHandler;
    touch: TouchHandler;
    keyboard: KeyboardHandler;
    foldingObserver: Folding;

    constructor(public diagram: Diagram) {
        this.mouse = new MouseHandler(this);
        this.touch = new TouchHandler(this);
        this.keyboard = new KeyboardHandler(this);
        this.foldingObserver = new Folding();
    }

    initializeContainer(container: HTMLElement): void {
        this.mouse.initializeMouseEvents(container);
        this.touch.initializeTouch(container);
        this.keyboard.initializeKeyboardEvents(container);

        this.foldingObserver.observe(container);

        this.addFocusEvents(container);
    }

    private addFocusEvents(container: HTMLElement): void {
        if (!this.diagram.plugin.view) {
            return;
        }

        this.diagram.plugin.view.registerDomEvent(container, 'focusin', () => {
            if (this.diagram.plugin.settings.automaticFolding) {
                container.removeClass('folded');
            }
            this.diagram.activeContainer = container;
        });

        this.diagram.plugin.view.registerDomEvent(container, 'focusout', () => {
            if (this.diagram.plugin.settings.automaticFolding) {
                container.addClass('folded');
            }
            this.diagram.activeContainer = container;
        });
    }
}
