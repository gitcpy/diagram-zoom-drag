import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { DiagramState } from './diagram-state/diagram-state';
import { DiagramControlPanel } from './diagram-control-panel/diagram-control-panel';
import DiagramEvents from './diagram-events/diagram-events';
import { DiagramActions } from './diagram-actions/diagram-actions';
import { DiagramContextMenu } from './diagram-context-menu/diagram-context-menu';
import { MarkdownPostProcessorContext } from 'obsidian';
import { DiagramData } from '../settings/typing/interfaces';
import { PanelsData } from './diagram-state/typing/interfaces';

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
    source!: string;
    panelsData!: PanelsData;

    constructor(public plugin: DiagramZoomDragPlugin) {
        this.state = new DiagramState(this);
        this.actions = new DiagramActions(this);
        this.events = new DiagramEvents(this);
        this.controlPanel = new DiagramControlPanel(this);
        this.contextMenu = new DiagramContextMenu(this);
    }

    get compoundSelector(): string {
        const diagrams = this.plugin.settings.supported_diagrams;
        return `${diagrams.reduce<string>((acc, diagram) => {
            if (diagram.on) {
                return acc ? `${acc}, ${diagram.selector}` : diagram.selector;
            }
            return acc;
        }, '')}`;
    }

    async initialize(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): Promise<void> {
        const maxWaitTime = 5000;

        if (await this.processDiagrams(element, context)) {
            return;
        }

        const observer = new MutationObserver(async () => {
            if (await this.processDiagrams(element, context)) {
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

    private async setDiagramContainer(
        contextElement: HTMLElement,
        context: MarkdownPostProcessorContext,
        diagram: { diagram: DiagramData; element: HTMLElement }
    ): Promise<void> {
        const el = diagram.element;

        if (!el.parentElement) {
            return;
        }
        if (el.parentElement.hasClass('diagram-container')) {
            return;
        }
        if (el.hasClass('diagram-content')) {
            return;
        }

        el.addClass('centered');
        el.addClass('diagram-content');

        const sectionsInfo = context.getSectionInfo(contextElement);
        if (!sectionsInfo) {
            return;
        }
        const { lineStart, lineEnd, text } = sectionsInfo;
        const lines = text.split('\n');
        const source = lines.slice(lineStart, lineEnd + 1).join('\n');

        const container = document.createElement('div');
        container.addClass('diagram-container');
        el.parentNode?.insertBefore(container, el);
        container.appendChild(el);
        container.id = await this.genID(lineStart, lineEnd, diagram.diagram);
        container.toggleClass('folded', this.plugin.settings.collapseByDefault);
        container.setAttribute('tabindex', '0');

        this.activeContainer = container;
        this.state.initializeContainer(container.id, source);

        this.controlPanel.initialize(container, diagram.diagram);
        this.events.initialize(container, diagram.diagram);
        this.contextMenu.initialize(container, diagram.diagram);

        const resizeObserver = new ResizeObserver(() => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const elementWidth = el.clientWidth;
            const elementHeight = el.clientHeight;

            if (
                containerWidth > 0 &&
                containerHeight > 0 &&
                elementWidth > 0 &&
                elementHeight > 0
            ) {
                this.actions.fitToContainer(el, container);
                resizeObserver.disconnect();
            }
        });

        resizeObserver.observe(container);
        resizeObserver.observe(el);

        setTimeout(() => {
            resizeObserver.disconnect();
            if (
                container.clientWidth > 0 &&
                container.clientHeight > 0 &&
                el.clientWidth > 0 &&
                el.clientHeight > 0
            ) {
                this.actions.fitToContainer(el, container);
            }
        }, 5000);
    }

    private async processDiagrams(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): Promise<boolean> {
        const diagram = this.querySelectorWithData(element);

        if (!diagram) {
            return false;
        }

        await this.setDiagramContainer(element, context, diagram);

        return true;
    }

    private querySelectorWithData(
        container: HTMLElement
    ): { diagram: DiagramData; element: HTMLElement } | null {
        for (const diagram of this.plugin.settings.supported_diagrams) {
            if (!diagram.on) {
                continue;
            }
            const element: HTMLElement | null = container.querySelector(
                diagram.selector
            );
            if (element) {
                return { element, diagram };
            }
        }
        return null;
    }

    private async genID(
        lineStart: number,
        lineEnd: number,
        diagram: DiagramData
    ): Promise<string> {
        const preId = `${diagram.name}:${lineStart}-${lineEnd}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(preId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        const ctime = this.plugin.view?.file?.stat.ctime ?? 0;
        return `id-${ctime}-${hash}`;
    }
}
