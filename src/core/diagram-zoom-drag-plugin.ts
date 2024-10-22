import {
    MarkdownPostProcessorContext,
    MarkdownView,
    Notice,
    Plugin,
} from 'obsidian';
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
import { DefaultSettings } from '../settings/typing/interfaces';

export default class DiagramZoomDragPlugin extends Plugin {
    view: MarkdownView | null = null;
    leafID!: LeafID | undefined;

    settings!: DefaultSettings;
    settingsManager!: SettingsManager;
    pluginStateChecker!: PluginStateChecker;
    publisher!: EventPublisher;
    observer!: EventObserver;
    diagram!: Diagram;

    /**
     * Initializes the plugin.
     *
     * This function initializes the plugin's core components, event system, and utilities.
     * It is called when the plugin is loading.
     *
     * @returns A promise that resolves when the plugin has been successfully initialized.
     */
    async initializePlugin(): Promise<void> {
        // @ts-ignore
        window.dzg = this;
        await this.initializeCore();
        await this.initializeUI();
        await this.initializeEventSystem();
        await this.initializeUtils();
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
    }

    /**
     * Asynchronously initializes the event system for handling events in the plugin.
     * This function sets up the EventPublisher and EventObserver instances, and registers event handlers for 'layout-change' and 'active-leaf-change' events.
     *
     * @returns A promise that resolves once the event system has been successfully initialized.
     */
    async initializeEventSystem(): Promise<void> {
        this.publisher = new EventPublisher(this);
        this.observer = new EventObserver(this);

        this.registerMarkdownPostProcessor(
            (element: HTMLElement, context: MarkdownPostProcessorContext) => {
                this.initializeView();
                this.diagram.initialize(element, context);
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
    }

    /**
     * Initializes the user interface for the plugin.
     *
     * this function initializes the diagram manager and adds a command to toggle the control panel visibility of the current active diagram.
     *
     * @returns A promise that resolves once the user interface has been successfully initialized.
     */
    async initializeUI(): Promise<void> {
        this.diagram = new Diagram(this);

        this.addCommand({
            id: 'diagram-zoom-drag-toggle-panels-state',
            name: 'Toggle control panel visibility of current active diagram',
            checkCallback: (checking) => {
                if (checking) {
                    return !!this.diagram.activeContainer;
                }

                const panels: NodeListOf<HTMLElement> | undefined =
                    this.diagram.activeContainer?.querySelectorAll(
                        '.diagram-container:not(.folded) .diagram-zoom-drag-panel:not(.diagram-fold-panel)'
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
     * Initializes the plugin when it is loaded.
     *
     * This function is called automatically when the plugin is loaded by Obsidian.
     * It initializes the plugin by calling `initializePlugin`.
     *
     * @returns A promise that resolves when the plugin has been fully initialized.
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
    }

    /**
     * Cleans up the view's diagram data when it is no longer
     * active.
     *
     * @returns {void} Void.
     */
    cleanupView(): void {
        if (this.leafID) {
            const isLeaf = this.app.workspace.getLeafById(this.leafID);
            if (isLeaf === null) {
                this.view = null;
                this.diagram.state.removeData(this.leafID);
                this.leafID = undefined;
            }
        }
    }

    /**
     * Displays a notice with the provided message for a specified duration.
     *
     * @param message - The message to display in the notice.
     * @param duration - The duration in milliseconds for which the notice should be displayed. Defaults to undefined.
     * @returns void
     */
    showNotice(message: string, duration?: number): void {
        new Notice(message, duration);
    }
}
