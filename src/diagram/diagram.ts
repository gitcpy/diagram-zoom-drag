import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { State } from './state/state';
import { ControlPanel } from './control-panel/control-panel';
import Events from './events/events';
import { DiagramActions } from './actions/diagram-actions';
import { ContextMenu } from './context-menu/context-menu';
import { MarkdownPostProcessorContext } from 'obsidian';
import { DiagramData } from '../settings/typing/interfaces';
import { PanelsData } from './state/typing/interfaces';

export class Diagram {
    readonly state: State;
    readonly controlPanel: ControlPanel;
    readonly events: Events;
    readonly actions: DiagramActions;
    readonly contextMenu: ContextMenu;

    activeContainer: HTMLElement | undefined = undefined;

    dx!: number;
    dy!: number;
    scale!: number;
    nativeTouchEventsEnabled!: boolean;
    source!: string;
    panelsData!: PanelsData;
    livePreviewObserver!: MutationObserver | undefined;

    constructor(public plugin: DiagramZoomDragPlugin) {
        this.state = new State(this);
        this.actions = new DiagramActions(this);
        this.events = new Events(this);
        this.controlPanel = new ControlPanel(this);
        this.contextMenu = new ContextMenu(this);
    }

    /**
     * Generates a compound CSS selector that matches all currently enabled diagrams.
     *
     * This getter constructs a comma-separated list of selectors for each diagram
     * that is enabled in the plugin's settings. The resulting string can be used
     * to apply styles or query all enabled diagram elements at once.
     *
     * @returns {string} A compound CSS selector string.
     */
    get compoundSelector(): string {
        const diagrams = this.plugin.settings.supported_diagrams;
        return diagrams.reduce<string>((acc, diagram) => {
            if (diagram.on) {
                return acc ? `${acc}, ${diagram.selector}` : diagram.selector;
            }
            return acc;
        }, '');
    }

    async initialize(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): Promise<void>;

    async initialize(element: HTMLElement): Promise<void>;

    /**
     * Initializes the diagram based on the provided element and context.
     *
     * This method determines the rendering mode by checking the presence of a context.
     * If a context is provided, it initializes the diagram in preview mode by invoking
     * the `initializePreview` method. Otherwise, it initializes in live preview mode
     * by calling `initializeLivePreview`.
     *
     * @param {HTMLElement} element - The HTML element representing the diagram container.
     * @param {MarkdownPostProcessorContext} [context] - Optional context indicating
     *        that rendering is in preview mode. If not provided, live preview mode is assumed.
     * @returns {Promise<void>} A promise that resolves once initialization is complete.
     */
    async initialize(
        element: HTMLElement,
        context?: MarkdownPostProcessorContext
    ): Promise<void> {
        if (context) {
            await this.initializePreview(element, context);
        } else {
            this.initializeLivePreview(element);
        }
    }

    /**
     * Initializes the diagram in preview mode by observing the provided element for any changes.
     *
     * This method waits for any diagram-related elements to be rendered within the provided element by
     * observing its DOM mutations. Once a diagram is detected, it processes the diagrams within the
     * preview by invoking `processDiagramsInPreview`. If no diagrams are found within a certain
     * time period (5000ms), it disconnects the observer.
     *
     * @param {HTMLElement} element - The HTML element representing the diagram container.
     * @param {MarkdownPostProcessorContext} context - The context indicating that rendering is in
     *        preview mode.
     * @returns {Promise<void>} A promise that resolves once initialization in preview mode is complete.
     */
    private async initializePreview(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): Promise<void> {
        const maxWaitTime = 5000;
        if (await this.processDiagramsInPreview(element, context)) {
            return;
        }

        const observer = new MutationObserver(async () => {
            if (await this.processDiagramsInPreview(element, context)) {
                observer.disconnect();
            }
        });

        observer.observe(element, {
            childList: true,
            subtree: true,
            attributes: false,
        });

        setTimeout(() => {
            observer.disconnect();
        }, maxWaitTime);
    }

    /**
     * Initializes the diagram in live preview mode by observing the provided content element for any changes.
     *
     * This method observes the provided content element for any added nodes and checks if the added node is a
     * diagram-related element. If it is, it processes the diagrams within the live preview by invoking
     * `setDiagramContainer`. If not, it creates a new observer for the added node and waits for any diagram-related
     * elements to be rendered within it. Once a diagram is detected, it processes the diagrams within the live
     * preview by invoking `setDiagramContainer`. If no diagrams are found within a certain time period (5000ms), it
     * disconnects the observer.
     *
     * @param {HTMLElement} contentEl - The HTML element representing the content element.
     */
    private initializeLivePreview(contentEl: HTMLElement): void {
        if (this.livePreviewObserver) {
            return;
        }

        const elementObservers = new Map<HTMLElement, MutationObserver>();

        const createPreviewObserver = (
            target: HTMLElement
        ): MutationObserver => {
            const observer = new MutationObserver(
                async (mutations, observer) => {
                    for (const mutation of mutations) {
                        const target = mutation.target as HTMLElement;
                        if (target.tagName !== 'DIV') {
                            continue;
                        }
                        const diagram = this.querySelectorWithData(target);
                        if (diagram) {
                            await this.setDiagramContainer(diagram);
                            observer.disconnect();
                            elementObservers.delete(target);
                        }
                    }
                }
            );

            elementObservers.set(target, observer);
            observer.observe(target, {
                childList: true,
                subtree: true,
            });

            setTimeout(() => {
                observer.disconnect();
                elementObservers.delete(target);
            }, 5000);

            return observer;
        };

        this.livePreviewObserver = new MutationObserver(async (mutations) => {
            const isLivePreview = this.plugin.livePreview;
            if (!isLivePreview) {
                return;
            }

            for (const mutation of mutations) {
                if (mutation.type !== 'childList') {
                    continue;
                }

                for (const addedNode of Array.from(mutation.addedNodes)) {
                    const target = addedNode as HTMLElement;

                    if (target.tagName !== 'DIV') {
                        continue;
                    }

                    if (
                        target?.matches('.cm-preview-code-block.cm-embed-block')
                    ) {
                        const diagram = this.querySelectorWithData(target);
                        if (diagram) {
                            await this.setDiagramContainer(diagram);
                            continue;
                        }
                        createPreviewObserver(target);
                    }
                }
            }
        });

        this.livePreviewObserver.observe(contentEl, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * Processes diagrams within the provided element in preview mode.
     *
     * This method checks for the existence of a diagram within the specified
     * HTML element. If a diagram is found, it sets up the diagram container
     * with the relevant context data for rendering in preview mode.
     *
     * @param {HTMLElement} element - The HTML element to search for a diagram.
     * @param {MarkdownPostProcessorContext} context - The context for rendering the diagram in preview mode.
     * @returns {Promise<boolean>} A promise that resolves to true if a diagram is found and processed, otherwise false.
     */
    private async processDiagramsInPreview(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): Promise<boolean> {
        const diagram = this.querySelectorWithData(element);

        if (!diagram) {
            return false;
        }

        await this.setDiagramContainer(diagram, {
            context: context,
            contextElement: element,
        });

        return true;
    }

    /**
     * Sets up the diagram container with the relevant context data for rendering.
     *
     * This method takes a diagram object with an element and a DiagramData object,
     * and sets up the diagram container with the relevant context data for rendering.
     *
     * If the `contextData` parameter is provided, the diagram container is set up
     * with the provided context data. Otherwise, the diagram container is set up
     * with the default context data.
     *
     * @param {Object} diagram - The diagram object with an element and a DiagramData object.
     * @param {Object} [contextData] - The context data to use for rendering the diagram.
     * @returns {Promise<void>} A promise that resolves once the diagram container is set up.
     */
    private async setDiagramContainer(
        diagram: { diagram: DiagramData; element: HTMLElement },
        contextData: {
            contextElement: HTMLElement;
            context: MarkdownPostProcessorContext;
        }
    ): Promise<void>;

    private async setDiagramContainer(diagram: {
        diagram: DiagramData;
        element: HTMLElement;
    }): Promise<void>;

    /**
     * Configures the diagram container by setting up necessary DOM elements and styles.
     *
     * This method is responsible for preparing the diagram's container element
     * by adding appropriate classes, setting up its source data, and initializing
     * various components such as control panels, event handlers, and context menus.
     * It handles both live preview and static preview modes.
     *
     * @param diagram - An object containing the diagram element and associated data.
     * @param contextData - Optional context data required to extract source information
     *                      when not in live preview mode. Includes the context element
     *                      and the Markdown post-processor context.
     * @returns A promise that resolves once the diagram container is fully set up.
     */
    private async setDiagramContainer(
        diagram: { diagram: DiagramData; element: HTMLElement },
        contextData?: {
            contextElement: HTMLElement;
            context: MarkdownPostProcessorContext;
        }
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

        const isLivePreview = this.plugin.livePreview;

        el.addClass('centered');
        el.addClass('diagram-content');

        let source: string, lineStart: number, lineEnd: number;

        if (!isLivePreview) {
            if (!contextData) {
                return;
            }
            const sectionsInfo = contextData.context.getSectionInfo(
                contextData.contextElement
            );
            if (!sectionsInfo) {
                return;
            }
            const { lineStart: ls, lineEnd: le, text } = sectionsInfo;
            lineStart = ls;
            lineEnd = le;
            const lines = text.split('\n');
            source = lines.slice(lineStart, lineEnd + 1).join('\n');
        } else {
            const e = this.plugin.view?.editor as unknown as any;
            const startPos = e.cm.posAtDOM(el.parentElement);
            const data = this.plugin.view?.editor.getValue().slice(startPos);
            source = data?.match(/^"?(```.+?```)/ms)?.[1] ?? 'No source';
            const endPos = startPos + source.length;
            lineStart = e.cm.state.doc.lineAt(startPos).number;
            lineEnd = e.cm.state.doc.lineAt(endPos).number;
        }

        const container = document.createElement('div');

        container.addClass('diagram-container');
        if (isLivePreview) {
            container.addClass('live-preview');
            el.parentElement.addClass('live-preview-parent');
        }
        el.parentNode?.insertBefore(container, el);
        container.appendChild(el);

        container.id = await this.genID(lineStart, lineEnd, diagram.diagram);
        container.toggleClass('folded', this.plugin.settings.collapseByDefault);
        if (isLivePreview) {
            container.parentElement?.toggleClass(
                'folded',
                this.plugin.settings.collapseByDefault
            );
        }
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

    /**
     * Searches for a diagram element within the provided container element.
     *
     * This method iterates over the list of supported diagrams and checks if
     * the diagram is enabled. If the diagram is enabled, it searches for an
     * element within the container element that matches the diagram's selector.
     * If an element is found, it returns an object containing the element and
     * the diagram data. Otherwise, it returns null.
     *
     * @param container - The container element to search for the diagram.
     * @returns An object containing the diagram element and the diagram data, or
     * null if no diagram is found.
     */
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

    /**
     * Generates a unique ID for a diagram.
     *
     * The ID is generated by encoding the diagram's name, start and end line
     * numbers as a UTF-8 string, and then hashing it using the SHA-256
     * algorithm. The hash is then concatenated with the current file's
     * modification time (in seconds since the Unix epoch) to produce a unique
     * identifier.
     *
     * @param lineStart - The starting line number of the code block containing
     * the diagram.
     * @param lineEnd - The ending line number of the code block containing the
     * diagram.
     * @param diagram - The diagram data object.
     * @returns A string representing the unique ID of the diagram.
     */
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
