import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { Notice, Platform, setIcon } from 'obsidian';

export default class ControlPanelController {
    private hiding: boolean = false;

    constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Adds the control panels to the given container.
     *
     * This function adds the move, zoom, and service panels to the given
     * container element. It also sets up the event listener for the
     * fullscreen handler.
     *
     * @param container - The container element to add the control panels to.
     */
    addControlPanel(container: HTMLElement): void {
        this.plugin.activeContainer = container;

        const movePanel = this.createMovePanel(container);
        const zoomPanel = this.createZoomPanel(container);
        const servicePanel = this.createServicePanel(
            container,
            movePanel,
            zoomPanel
        );

        container.appendChild(movePanel);
        container.appendChild(zoomPanel);
        container.appendChild(servicePanel);

        this.setupFullscreenHandler(container);
    }

    /**
     * Creates the move panel for the given container.
     *
     * This function creates a panel element with the class
     * `diagram-move-panel` and adds the move buttons to it. The move
     * buttons are created by {@link getMoveButtons}.
     *
     * @param container - The container element to create the move panel for.
     * @returns The created move panel element.
     */
    private createMovePanel(container: HTMLElement): HTMLElement {
        const movePanel = this.createPanel('diagram-move-panel', {
            ...this.panelStyles,
            right: '10px',
            bottom: '10px',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
        });

        const moveButtons = this.getMoveButtons(container);
        moveButtons.forEach((btn) =>
            movePanel.appendChild(
                this.createButton(
                    btn.icon,
                    btn.action,
                    btn.title,
                    btn.active,
                    btn.id
                )
            )
        );

        return movePanel;
    }

    /**
     * Creates the zoom panel for the given container.
     *
     * This function creates a panel element with the class
     * `diagram-zoom-panel` and adds the zoom buttons to it. The zoom
     * buttons are created by {@link getZoomButtons}.
     *
     * @param container - The container element to create the zoom panel for.
     * @returns The created zoom panel element.
     */
    private createZoomPanel(container: HTMLElement): HTMLElement {
        const zoomPanel = this.createPanel('diagram-zoom-panel', {
            ...this.panelStyles,
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            gridTemplateColumns: '1fr',
        });

        const zoomButtons = this.getZoomButtons(container);
        zoomButtons.forEach((btn) =>
            zoomPanel.appendChild(
                this.createButton(btn.icon, btn.action, btn.title, true)
            )
        );

        return zoomPanel;
    }

    /**
     * Creates the service panel for the given container.
     *
     * This function creates a panel element with the class
     * `diagram-service-panel` and adds the service buttons to it. The service
     * buttons are created by {@link getServiceButtons}.
     *
     * @param container - The container element to create the service panel for.
     * @param movePanel - The move panel element used in hide / show action.
     * @param zoomPanel - The zoom panel element used in hide / show action.
     * @returns The created service panel element.
     */
    private createServicePanel(
        container: HTMLElement,
        movePanel: HTMLElement,
        zoomPanel: HTMLElement
    ): HTMLElement {
        const servicePanel = this.createPanel('diagram-service-panel', {
            ...this.panelStyles,
            right: '10px',
            top: '10px',
            gridTemplateColumns: 'repeat(2, 1fr)',
        });

        const serviceButtons = this.getServiceButtons(
            container,
            movePanel,
            zoomPanel
        );
        serviceButtons.forEach((btn) =>
            servicePanel.appendChild(
                this.createButton(btn.icon, btn.action, btn.title, true, btn.id)
            )
        );

        return servicePanel;
    }

    /**
     * Creates a panel element with a given class name and styles.
     *
     * This function creates a `div` element with a given class name and
     * applies the given styles to it. It is used to create the move, zoom,
     * and service panels.
     *
     * @param className - The class name for the created panel.
     * @param styles - The styles for the created panel.
     * @returns The created panel element.
     */
    private createPanel(className: string, styles: object): HTMLElement {
        const panel = this.plugin.activeContainer.doc.createElement('div');
        panel.className = className;
        panel.setCssStyles(styles);
        return panel;
    }

    /**
     * Creates a button element for use in the plugin's control panels.
     *
     * This function creates a `button` element with a given class name,
     * icon, and title. It applies various styles to the created button,
     * including styles for active and inactive states. It also registers
     * event listeners for mouse click and hover events.
     *
     * @param icon - The icon to display on the button.
     * @param action - The function to call when the button is clicked.
     * @param title - The title of the button, used for accessibility.
     * @param active - Whether the button should be active or inactive.
     * @param id - An optional ID for the button.
     * @returns The created button element.
     */
    private createButton(
        icon: string,
        action: () => void,
        title: string,
        active = true,
        id: string | undefined = undefined
    ): HTMLElement {
        const button = this.plugin.activeContainer.doc.createElement('button');
        button.className = 'button';
        button.id = id ?? '';

        if (active) {
            button.setCssStyles({
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'background-color 0.2s ease',
                pointerEvents: 'auto',
            });
            setIcon(button, icon);

            this.plugin.view.registerDomEvent(button, 'click', action);

            this.plugin.view.registerDomEvent(button, 'mouseenter', () => {
                button.setCssStyles({
                    color: 'var(--interactive-accent)',
                });
            });

            this.plugin.view.registerDomEvent(button, 'mouseleave', () => {
                button.setCssStyles({
                    color: 'var(--text-muted)',
                });
            });
        } else {
            button.setCssStyles({
                visibility: 'hidden',
            });
        }

        button.setAttribute('aria-label', title);
        return button;
    }

    /**
     * The default styles for a control panel.
     *
     * @returns An object containing the CSS styles for a control panel.
     */
    private get panelStyles(): object {
        return {
            position: 'absolute',
            display: 'grid',
            gap: '5px',
            background: 'rgba(var(--background-primary-rgb), 0.7)',
            padding: '5px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        };
    }

    /**
     * Creates an array of move buttons for the given container.
     *
     * The created buttons are objects with the following properties:
     * - `icon`: The icon to display on the button.
     * - `action`: The action to execute when the button is clicked.
     * - `title`: The title of the button.
     * - `active`: A boolean indicating whether the button is active.
     * - `id`: An optional string to identify the button.
     *
     * @param container - The container element to create the move buttons for.
     * @returns An array of move buttons.
     */
    private getMoveButtons(container: HTMLElement): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
    }> {
        return [
            {
                icon: 'arrow-up-left',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        50,
                        50,
                        true
                    ),
                title: 'Move up left',
            },
            {
                icon: 'arrow-up',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        0,
                        50,
                        true
                    ),
                title: 'Move up',
            },
            {
                icon: 'arrow-up-right',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        -50,
                        50,
                        true
                    ),
                title: 'Move up right',
            },
            {
                icon: 'arrow-left',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        50,
                        0,
                        true
                    ),
                title: 'Move left',
            },
            {
                icon: '',
                action: (): void => {},
                title: '',
                active: false,
                id: '',
            },
            {
                icon: 'arrow-right',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        -50,
                        0,
                        true
                    ),
                title: 'Move right',
            },
            {
                icon: 'arrow-down-left',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        50,
                        -50,
                        true
                    ),
                title: 'Move down left',
            },
            {
                icon: 'arrow-down',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        0,
                        -50,
                        true
                    ),
                title: 'Move down',
            },
            {
                icon: 'arrow-down-right',
                action: (): void =>
                    this.plugin.diagramController.moveElement(
                        container,
                        -50,
                        -50,
                        true
                    ),
                title: 'Move down right',
            },
        ];
    }

    /**
     * Returns an array of objects, each of which describes a zoom-related button
     * to be added to the zoom panel.
     *
     * The objects in the returned array each have the following properties:
     * * `icon`: The icon to display on the button.
     * * `action`: The action to take when the button is clicked.
     * * `title`: The title of the button, used for accessibility.
     *
     * @param container - The container element for which the zoom buttons
     * are being created.
     * @returns An array of objects, each of which describes a zoom-related button.
     */
    private getZoomButtons(
        container: HTMLElement
    ): Array<{ icon: string; action: () => void; title: string }> {
        return [
            {
                icon: 'zoom-in',
                action: (): void =>
                    this.plugin.diagramController.zoomElement(
                        container,
                        1.1,
                        true
                    ),
                title: 'Zoom In',
            },
            {
                icon: 'refresh-cw',
                action: (): void =>
                    this.plugin.diagramController.resetZoomAndMove(
                        container,
                        true
                    ),
                title: 'Reset Zoom and Position',
            },
            {
                icon: 'zoom-out',
                action: (): void =>
                    this.plugin.diagramController.zoomElement(
                        container,
                        0.9,
                        true
                    ),
                title: 'Zoom Out',
            },
        ];
    }

    /**
     * Returns an array of objects, each of which describes a service button to
     * be added to the service panel.
     *
     * The objects in the returned array each have the following properties:
     * * `icon`: The icon to display on the button.
     * * `action`: The action to take when the button is clicked.
     * * `title`: The title of the button, used for accessibility.
     * * `id`: The id of the button, used for styling.
     *
     * The returned array contains two buttons on desktop platforms:
     *   1. A button to hide or show the move and zoom panels.
     *   2. A button to open the diagram in fullscreen mode.
     * The returned array contains three buttons on mobile platforms:
     *   1. A button to hide or show the move and zoom panels.
     *   2. A button to open the diagram in fullscreen mode.
     *   3. A button to enable or disable native touch events.
     *
     * @param container - The container element for which the service buttons
     * are being created.
     * @param movePanel - The move panel element used in hide / show action.
     * @param zoomPanel - The zoom panel element used in hide / show action.
     * @returns An array of objects, each of which describes a service button.
     */
    private getServiceButtons(
        container: HTMLElement,
        movePanel: HTMLElement,
        zoomPanel: HTMLElement
    ): Array<{ icon: string; action: () => void; title: string; id?: string }> {
        const buttons = [
            {
                icon: this.hiding ? 'eye-off' : 'eye',
                action: (): void => this.hideShowAction(movePanel, zoomPanel),
                title: `Hide move and zoom panels`,
                id: 'hide-show-button-diagram',
            },
            {
                icon: 'maximize',
                action: async (): Promise<void> =>
                    this.toggleFullscreen(container),
                title: 'Open in fullscreen mode',
                id: 'open-fullscreen-button',
            },
        ];

        if (Platform.isMobile) {
            buttons.push({
                icon: this.plugin.nativeTouchEventsEnabled
                    ? 'circle-slash-2'
                    : 'hand',
                action: (): void => this.toggleNativeEventsAction(container),
                title: `${this.plugin.nativeTouchEventsEnabled ? 'Enable' : 'Disable'} move and pinch zoom`,
                id: 'native-touch-events',
            });
            this.plugin.eventController.addTouchEvents(container);
        }

        return buttons;
    }

    /**
     * Toggles the visibility of the move and zoom panels.
     *
     * If the `hiding` property is `false`, this function sets the `visibility`
     * CSS property of the given panels to `'hidden'` and the `pointerEvents` CSS property to `'none'`.
     * Otherwise, it sets `visibility` to `'visible'` and `pointerEvents` to `'auto'`.
     * It also updates the icon and aria-label of the button with ID `'hide-show-button-diagram'`.
     *
     * @param movePanel - The move panel element to be toggled.
     * @param zoomPanel - The zoom panel element to be toggled.
     */
    private hideShowAction(
        movePanel: HTMLElement,
        zoomPanel: HTMLElement
    ): void {
        this.hiding = !this.hiding;
        [movePanel, zoomPanel].forEach((panel) => {
            panel.setCssStyles({
                visibility: this.hiding ? 'hidden' : 'visible',
                pointerEvents: this.hiding ? 'none' : 'auto',
            });
        });
        const button = this.plugin.activeContainer.doc.getElementById(
            'hide-show-button-diagram'
        );
        if (!button) {
            return;
        }
        setIcon(button, this.hiding ? 'eye-off' : 'eye');
        button.setAttribute(
            'aria-label',
            `${this.hiding ? 'Show' : 'Hide'} move and zoom panels`
        );
    }

    /**
     * Toggles the fullscreen state of the given container element.
     *
     * If the container is not currently in fullscreen mode, this function
     * requests fullscreen mode for the container and updates the icon and
     * aria-label of the button with ID `'open-fullscreen-button'` to indicate
     * that the container can be exited from fullscreen mode.  Otherwise, it
     * exits fullscreen mode and updates the icon and aria-label to indicate
     * that the container can be entered into fullscreen mode.
     *
     * @param container - The container element to be toggled into or out of
     *                    fullscreen mode.
     * @returns {Promise<void>} A promise that resolves when the container has
     *          been successfully toggled into or out of fullscreen mode.
     */
    private async toggleFullscreen(container: HTMLElement): Promise<void> {
        const button = container.querySelector(
            '#open-fullscreen-button'
        ) as HTMLElement | null;
        if (!button) {
            return;
        }
        if (!container.doc.fullscreenElement) {
            await container.requestFullscreen({ navigationUI: 'auto' });
            setIcon(button, 'minimize');
        } else {
            await container.doc.exitFullscreen();
            setIcon(button, 'maximize');
        }
    }

    /**
     * Toggles the native touch event handling for the diagram.
     *
     * When native touch event handling is enabled, the Obsidian will respond to
     * touch events directly. Otherwise, the plugin will handle touch events
     * itself.
     *
     * This function updates the button with ID `'native-touch-events'` to
     * reflect the new state of native touch event handling. It also updates the
     * aria-label of the button and displays a notice to the user to inform them
     * of the change.
     *
     * @param container - The container element for the diagram.
     */
    private toggleNativeEventsAction(container: HTMLElement): void {
        this.plugin.nativeTouchEventsEnabled =
            !this.plugin.nativeTouchEventsEnabled;
        const btn = container.doc.getElementById('native-touch-events');
        if (!btn) {
            return;
        }
        setIcon(
            btn,
            this.plugin.nativeTouchEventsEnabled ? 'circle-slash-2' : 'hand'
        );
        const fl = this.plugin.nativeTouchEventsEnabled;
        btn.ariaLabel = `${fl ? 'Enable' : 'Disable'} move and pinch zoom`;
        new Notice(
            `Native touches are ${fl ? 'enabled' : 'disabled'} now. You ${fl ? 'cannot' : 'can'} move and pinch zoom diagram diagram.`
        );
    }

    /**
     * Sets up the handler for the `fullscreenchange` event on the given container.
     *
     * This function adds a keyboard event handler to the container, which will be
     * registered with the `.obsidian-app` element when the container enters
     * fullscreen mode. It will be unregistered when the container exits
     * fullscreen mode, and the container will be focused.
     *
     * @param container - The container element for the diagram.
     */
    private setupFullscreenHandler(container: HTMLElement): void {
        const fullScreenKeyboardHandler =
            this.plugin.eventController.addKeyboardEvents(container);
        container.onfullscreenchange = (): void => {
            const fullscreenEl = document.querySelector(
                '.obsidian-app'
            ) as HTMLElement;
            if (container === document.fullscreenElement) {
                this.plugin.view.registerDomEvent(
                    fullscreenEl,
                    'keydown',
                    fullScreenKeyboardHandler
                );
            } else {
                fullscreenEl.removeEventListener(
                    'keydown',
                    fullScreenKeyboardHandler
                );
                container.focus();
            }
        };
    }
}
