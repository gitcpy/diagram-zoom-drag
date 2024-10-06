import { MarkdownPostProcessorContext, MarkdownView, Plugin } from 'obsidian';
import { ContainerID, LeafID } from '../typing/typing';
import { ViewDataController } from '../controllers/view-data-controller';
import { v4 as uuidv4 } from 'uuid';
import SettingsManager, {
    DEFAULT_SETTINGS_Interface,
} from '../settings/settings-manager';
import { SettingsTab } from '../settings/settings-tab';
import PluginStateChecker from './plugin-state-checker';
import { DiagramController } from '../controllers/diagram-controller';
import EventController from '../controllers/event-controller';
import ControlPanelController from '../controllers/control-panel-controller';
import MutationObserverController from '../controllers/mutation-observer-controller';

export default class DiagramZoomDragPlugin extends Plugin {
    dx!: number;
    dy!: number;
    scale!: number;
    nativeTouchEventsEnabled!: boolean;
    view!: MarkdownView;
    leafID!: LeafID | undefined;
    viewData!: ViewDataController;
    activeContainer!: HTMLElement;
    settingsManager!: SettingsManager;
    settings!: DEFAULT_SETTINGS_Interface;
    pluginStateChecker!: PluginStateChecker;
    diagramController!: DiagramController;
    eventController!: EventController;
    controlPanelController!: ControlPanelController;
    mutationObserverController!: MutationObserverController;

    /**
     * Initializes the plugin.
     *
     * This function initializes the plugin's core, event system, controllers, and utilities.
     * It is called when the plugin is enabled.
     *
     * @returns A promise that resolves when the plugin has been successfully initialized.
     */
    async initializePlugin() {
        await this.initializeCore();
        await this.initializeEventSystem();
        await this.initializeControllers();
        await this.initializeUtils();
    }

    /**
     * Initializes the plugin's core components.
     *
     * This function initializes the plugin's settings manager and adds a settings tab to the Obsidian settings panel.
     *
     * @returns A promise that resolves when the plugin's core components have been successfully initialized.
     */
    async initializeCore() {
        this.settingsManager = new SettingsManager(this);
        await this.settingsManager.loadSettings();
        this.addSettingTab(new SettingsTab(this.app, this));
    }

    /**
     * Initializes the plugin's controllers.
     *
     * This function initializes the plugin's controllers, which are responsible for managing the plugin's state and behavior.
     *
     * @returns A promise that resolves when the plugin's controllers have been successfully initialized.
     */
    async initializeControllers() {
        this.viewData = new ViewDataController(this);
        this.diagramController = new DiagramController(this);
        this.eventController = new EventController(this);
        this.controlPanelController = new ControlPanelController(this);
    }

    /**
     * Initializes the event system for the plugin.
     *
     * This method registers several events and post-processors to monitor and respond
     * to changes in the workspace. Specifically, it handles layout changes,
     * active leaf changes, and markdown post-processing.
     *
     * - **Markdown Post-Processor**:
     *   This post-processor is responsible for initializing the view and cleaning up
     *   any previous state when new markdown content is rendered in the view.
     *
     * - **Layout Change Event**:
     *   Triggers when the workspace layout changes, ensuring the plugin can handle
     *   any relevant changes in view setup and state.
     *
     * - **Active Leaf Change Event**:
     *   Monitors changes in the active leaf (the currently active view),
     *   ensuring the correct initialization and cleanup of the view when the user
     *   switches between views.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves once all events and post-processors are registered.
     */
    async initializeEventSystem() {
        this.registerMarkdownPostProcessor(
            (element: HTMLElement, context: MarkdownPostProcessorContext) => {
                this.cleanupView();
                this.initializeView();
            }
        );

        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.cleanupView();
                this.initializeView();
            })
        );

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => {
                this.cleanupView();
                this.initializeView();
            })
        );
        this.mutationObserverController = new MutationObserverController(this);
    }

    /**
     * Initializes the plugin's utility classes.
     *
     * This function initializes the PluginStateChecker, which is responsible for
     * checking if the plugin is being opened for the first time
     *
     * @returns A promise that resolves when the plugin's utilities have been
     *          successfully initialized.
     */
    async initializeUtils() {
        this.pluginStateChecker = new PluginStateChecker(this);
    }

    /**
     * The main entry point for the plugin.
     *
     * This function is automatically called by Obsidian when the plugin is loaded.
     * It initializes the plugin and sets up all of its components.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves once the plugin has been
     *          successfully initialized.
     */
    async onload(): Promise<void> {
        await this.initializePlugin();
    }

    /**
     * A compound CSS selector that targets all of the supported diagrams.
     *
     * This property is a getter that returns a string representing a compound
     * CSS selector. The selector is generated by concatenating the selectors
     * of all the supported diagrams.
     *
     * @returns {string} A compound CSS selector.
     */
    get compoundSelector(): string {
        const diagrams = this.settings.supported_diagrams;
        return diagrams.reduce<string>(
            (acc, diagram) =>
                acc ? `${acc}, ${diagram.selector}` : diagram.selector,
            ''
        );
    }

    /**
     * Initializes the plugin's features for all diagrams in a given element.
     *
     * This function is responsible for initializing the plugin's features for
     * all diagrams within a given element. It sets up a MutationObserver to
     * observe for changes in the element's child list and subtree, and
     * initializes the plugin's features for all diagrams within the element.
     *
     * @param ele - The element to initialize the plugin's features for.
     */
    initializeDiagramFeatures(ele: HTMLElement): void {
        const observer = new MutationObserver(() => {
            this.initializeDiagramElements(ele);
        });

        observer.observe(ele, { childList: true, subtree: true });
        this.initializeDiagramElements(ele);
    }

    initializeDiagramElements(ele: HTMLElement): void {
        this.addDiagramContainers(ele);
    }

    /**
     * Adds a diagram container element to each diagram element within a given
     * element.
     *
     * This function is responsible for adding a diagram container element to
     * each diagram element within a given element. It sets up the container
     * element, adds the diagram element to it, sets up the event listeners
     * and initializes the plugin's features for the diagram.
     *
     * @param ele - The element to add the diagram container to.
     */
    addDiagramContainers(ele: HTMLElement): void {
        const diagramElements = ele.querySelectorAll(this.compoundSelector);

        diagramElements.forEach((el) => {
            if (!el.classList.contains('centered')) {
                el.classList.add('centered');
            }

            if (!el.parentElement?.classList.contains('diagram-container')) {
                const container = ele.doc.createElement('div');
                container.addClass('diagram-container');

                el.parentNode?.insertBefore(container, el);
                container.appendChild(el);
                container.id = uuidv4();
                const el_html = el as HTMLElement;
                el_html.setCssStyles({
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    transformOrigin: 'top left',
                    cursor: 'grab',
                    width: '100%',
                    height: '100%',
                });

                this.initializeViewData(container.id);
                this.controlPanelController.addControlPanel(container);
                this.eventController.addMouseEvents(container);
                this.mutationObserverController.addFoldingObserver(container);
                this.eventController.addFocusEvents(container);

                this.eventController.toggleVisibilityOnMouseHoverDiagram(
                    container
                );

                if (this.settings.foldByDefault) {
                    container.addClass('folded');
                }
                container.setAttribute('tabindex', '0');
                this.view.registerDomEvent(
                    container,
                    'keydown',
                    this.eventController.addKeyboardEvents(container),
                    { passive: false }
                );
                setTimeout(() => {
                    this.diagramController.fitToContainer(el_html, container);
                }, 0);
            }
        });
    }

    /**
     * Initializes the plugin's features for the active view.
     *
     * This function initializes the plugin's features for the active view by
     * getting the active view, getting the view's leaf ID and content element,
     * and initializing the plugin's features for the content element.
     *
     * @returns {void} Void.
     */
    initializeView(): void {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }

        const leafID = view.leaf.id;
        this.leafID = leafID;
        this.view = view;
        this.initializeDiagramFeatures(this.view.contentEl);
    }

    /**
     * Cleans up the plugin's features for the active view.
     *
     * This function cleans up the plugin's features for the active view by
     * removing the view's data from the plugin's data map if the view is no
     * longer active.
     *
     * @returns {void} Void.
     */
    cleanupView(): void {
        if (this.leafID) {
            const isLeaf = this.app.workspace.getLeafById(this.leafID);
            if (isLeaf === null) {
                this.viewData.removeData(this.leafID!);
                this.leafID = undefined;
            }
        }
    }

    /**
     * Initializes the plugin's view data for a given container ID.
     *
     * This function initializes the plugin's view data for a given container ID
     * by calling the `initializeView` method of the `ViewDataController` with
     * the active leaf ID and the given container ID.
     *
     * @param containerID - The container ID to initialize the view data for.
     *
     * @returns {void} Void.
     */
    initializeViewData(containerID: ContainerID): void {
        this.viewData.initializeView(this.leafID!, containerID);
    }
}
