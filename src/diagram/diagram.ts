import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { v4 as uuidv4 } from 'uuid';
import { DiagramState } from './diagram-state/diagram-state';
import { DiagramControlPanel } from './diagram-control-panel/diagram-control-panel';
import DiagramEvents from './diagram-events/diagram-events';
import { DiagramActions } from './diagram-actions/diagram-actions';
import { DiagramContextMenu } from './diagram-context-menu/diagram-context-menu';
import { MarkdownPostProcessorContext } from 'obsidian';

export class Diagram {
    readonly state: DiagramState;
    readonly controlPanel: DiagramControlPanel;
    readonly events: DiagramEvents;
    readonly actions: DiagramActions;
    readonly contextMenu: DiagramContextMenu;

    activeContainer: HTMLElement | undefined = undefined;

    dx!: number;
    dy!: number;
    scale!: number;
    nativeTouchEventsEnabled!: boolean;

    currentSource: string | undefined = undefined;

    constructor(public plugin: DiagramZoomDragPlugin) {
        this.state = new DiagramState(this);
        this.actions = new DiagramActions(this);
        this.events = new DiagramEvents(this);
        this.controlPanel = new DiagramControlPanel(this);
        this.contextMenu = new DiagramContextMenu(this);
    }

    get compoundSelector(): string {
        const diagrams = this.plugin.settings.supported_diagrams;
        return `.${diagrams.reduce<string>(
            (acc, diagram) =>
                acc ? `${acc}, ${diagram.selector}` : diagram.selector,
            ''
        )}`;
    }

    initialize(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): void {
        const maxWaitTime = 5000;

        if (this.processDiagrams(element, context)) {
            return;
        }

        const observer = new MutationObserver((mutations) => {
            if (this.processDiagrams(element, context)) {
                observer.disconnect();
            }
        });

        observer.observe(element, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
        }, maxWaitTime);
    }

    private setDiagramContainer(el: HTMLElement): void {
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
        container.toggleClass('folded', this.plugin.settings.foldingByDefault);
        container.setAttribute('tabindex', '0');

        el.addClass('diagram-content');

        if (this.plugin.leafID) {
            this.state.initializeContainer(this.plugin.leafID, container.id);
        }

        if (this.plugin.leafID && this.currentSource) {
            this.state.initializeContainerSource(
                this.plugin.leafID,
                container.id,
                this.currentSource
            );
            this.currentSource = undefined;
        }

        this.controlPanel.initialize(container);
        this.events.initialize(container);
        this.contextMenu.initialize(container);

        setTimeout(() => {
            this.actions.fitToContainer(el, container);
        }, 0);
    }

    private processDiagrams(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): boolean {
        const isDiagram: NodeListOf<HTMLElement> = element.querySelectorAll(
            this.compoundSelector
        );

        if (isDiagram.length === 0) {
            return false;
        }

        const sectionsInfo = context.getSectionInfo(element);

        if (sectionsInfo) {
            const { lineStart, lineEnd, text } = sectionsInfo;
            const lines = text.split('\n');
            const slice = lines.slice(lineStart, lineEnd + 1).join('\n');
            this.currentSource = slice;
        }

        this.setDiagramContainer(isDiagram[0]);

        return true;
    }
}
