import { MarkdownPostProcessorContext, MarkdownView, Plugin } from 'obsidian';
import SettingsManager from '../settings/settings-manager';
import { SettingsTab } from '../settings/settings-tab';
import PluginStateChecker from './plugin-state-checker';

import {
    EventObserver,
    EventPublisher,
} from '../events-management/events-management';
import { publishPanelsStateEvent } from '../helpers/helpers';
import { Diagram } from '../diagram/diagram';
import { LeafID } from '../diagram/diagram-state/typing/types';
import { DEFAULT_SETTINGS } from '../settings/typing/interfaces';

export default class DiagramZoomDragPlugin extends Plugin {
    view: MarkdownView | null = null;
    leafID!: LeafID | undefined;
    settingsManager!: SettingsManager;
    settings!: DEFAULT_SETTINGS;
    pluginStateChecker!: PluginStateChecker;
    publisher!: EventPublisher;
    observer!: EventObserver;
    diagram!: Diagram;

    /**
     * Initializes the plugin.
     *
     * This function initializes the plugin's core, event system, controllers, and utilities.
     * It is called when the plugin is enabled.
     *
     * @returns A promise that resolves when the plugin has been successfully initialized.
     */
    async initializePlugin(): Promise<void> {
        await this.initializeCore();
        await this.initializeEventSystem();
        await this.initializeUtils();
        // @ts-ignore
        window.mermaidZoomDragPlugin = this;
    }

    /**
     * Initializes the plugin's core components.
     *
     * This function initializes the plugin's settings manager and adds a settings tab to the Obsidian settings panel.
     *
     * @returns A promise that resolves when the plugin's core components have been successfully initialized.
     */
    async initializeCore(): Promise<void> {
        this.settingsManager = new SettingsManager(this);
        await this.settingsManager.loadSettings();
        this.addSettingTab(new SettingsTab(this.app, this));
        this.addCommand({
            id: 'mermaid-zoom-drag-toggle-panels-state',
            name: 'Toggle panel visibility',
            checkCallback: (checking) => {
                if (checking) {
                    return !!this.diagram.activeContainer;
                }

                const panels: NodeListOf<HTMLElement> | undefined =
                    this.diagram.activeContainer?.querySelectorAll(
                        '.diagram-container:not(.folded) .mermaid-zoom-drag-panel:not(.diagram-fold-panel)'
                    );
                if (!panels) {
                    return;
                }

                const state = panels[0].hasClass('hidden');

                panels.forEach((panel) => {
                    if (state) {
                        panel.removeClass('hidden');
                        panel.addClass('visible');
                        publishPanelsStateEvent(this, true);
                    } else {
                        panel.removeClass('visible');
                        panel.addClass('hidden');
                        publishPanelsStateEvent(this, false);
                    }
                });
            },
        });

        this.diagram = new Diagram(this);
    }

    async initializeEventSystem(): Promise<void> {
        this.publisher = new EventPublisher(this);
        this.observer = new EventObserver(this);
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
            this.app.workspace.on('active-leaf-change', (leaf) => {
                this.cleanupView();
                this.initializeView();
            })
        );
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
    async initializeUtils(): Promise<void> {
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

        this.leafID = view.leaf.id;
        this.view = view;
        this.diagram.initializeDiagramFeatures(this.view.contentEl);
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
                this.view = null;
                this.diagram.diagramState.removeData(this.leafID);
                this.leafID = undefined;
            }
        }
    }
}
