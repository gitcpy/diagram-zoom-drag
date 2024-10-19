import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { v4 as uuidv4 } from 'uuid';
import { DiagramState } from './diagram-state/diagram-state';
import { DiagramControlPanel } from './diagram-control-panel/diagram-control-panel';
import DiagramEvents from './diagram-events/diagram-events';
import { DiagramActions } from './diagram-actions/diagram-actions';

export class Diagram {
    readonly diagramState: DiagramState;
    readonly diagramControlPanel: DiagramControlPanel;
    readonly diagramEvents: DiagramEvents;
    readonly diagramActions: DiagramActions;
    activeContainer: HTMLElement | undefined = undefined;

    dx!: number;
    dy!: number;
    scale!: number;
    nativeTouchEventsEnabled!: boolean;

    constructor(public plugin: DiagramZoomDragPlugin) {
        this.diagramState = new DiagramState(this);
        this.diagramActions = new DiagramActions(this);
        this.diagramEvents = new DiagramEvents(this);
        this.diagramControlPanel = new DiagramControlPanel(this);
    }

    get compoundSelector(): string {
        const diagrams = this.plugin.settings.supported_diagrams;
        return diagrams.reduce<string>(
            (acc, diagram) =>
                acc ? `${acc}, ${diagram.selector}` : diagram.selector,
            ''
        );
    }

    initializeDiagramFeatures(ele: HTMLElement): void {
        const observer = new MutationObserver(() => {
            this.setDiagramContainers(ele);
        });

        observer.observe(ele, { childList: true, subtree: true });
        this.setDiagramContainers(ele);
    }

    setDiagramContainers(ele: HTMLElement): void {
        const diagramElements: NodeListOf<HTMLElement> = ele.querySelectorAll(
            this.compoundSelector
        );

        diagramElements.forEach((el) => {
            el.addClass('centered');

            if (!el.parentElement) {
                return;
            }

            if (el.parentElement.hasClass('diagram-container')) {
                return;
            }

            const container = document.createElement('div');
            container.addClass('diagram-container');
            el.parentNode?.insertBefore(container, el);
            container.appendChild(el);
            container.id = uuidv4();
            container.toggleClass('folded', this.plugin.settings.foldByDefault);
            container.setAttribute('tabindex', '0');

            el.addClass('diagram-content');

            if (this.plugin.leafID) {
                this.diagramState.initializeContainer(
                    this.plugin.leafID,
                    container.id
                );
            }
            this.diagramControlPanel.initialize(container);
            this.diagramEvents.initializeContainer(container);

            setTimeout(() => {
                this.diagramActions.fitToContainer(el, container);
            }, 0);
        });
    }
}
