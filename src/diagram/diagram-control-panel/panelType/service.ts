import { PanelType } from '../typing/interfaces';
import { Platform } from 'obsidian';
import { updateButton } from '../../../helpers/helpers';
import { Diagram } from '../../diagram';
import { DiagramControlPanel } from '../diagram-control-panel';

export class ServicePanel implements PanelType {
    panel!: HTMLElement;
    hiding = false;

    constructor(
        private readonly diagram: Diagram,
        private readonly diagramControlPanel: DiagramControlPanel
    ) {}

    /**
     * Initializes the service panel.
     *
     * This method creates the HTML element of the service panel and assigns it to the `panel` property.
     */
    initialize(): void {
        this.panel = this.createPanel();
    }

    /**
     * Returns an array of objects representing the buttons in the service panel.
     *
     * The buttons are objects with the following properties:
     * - `icon`: The icon to display in the button.
     * - `action`: The action to perform when the button is clicked.
     * - `title`: The title of the button.
     * - `active`: Whether the button is active or not.
     * - `id`: The id of the button.
     *
     * The service panel has the following buttons:
     * - A button to hide and show the move and zoom panels.
     * - A button to open the diagram in fullscreen mode.
     * - A button to enable and disable native touch events for the diagram.
     *
     * @param container The container to which the service panel is attached.
     * @returns An array of objects representing the buttons in the service panel.
     */
    getButtons(container: HTMLElement): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
    }> {
        const buttons = [
            {
                icon: this.hiding ? 'eye-off' : 'eye',
                action: (): void => {
                    const panelsData = this.diagram.diagramState.panelsData;

                    if (!panelsData?.panels) {
                        return;
                    }

                    this.hiding = !this.hiding;

                    [panelsData.panels.move, panelsData.panels.zoom].forEach(
                        (panel) => {
                            panel.panel.toggleClass('hidden', this.hiding);
                            panel.panel.toggleClass('visible', !this.hiding);
                        }
                    );

                    const button: HTMLElement | null = this.panel.querySelector(
                        '#hide-show-button-diagram'
                    );
                    if (!button) {
                        return;
                    }
                    updateButton(
                        button,
                        !this.hiding ? 'eye' : 'eye-off',
                        `${this.hiding ? 'Show' : 'Hide'} move and zoom panels`
                    );
                },
                title: `Hide move and zoom panels`,
                id: 'hide-show-button-diagram',
            },
            {
                icon: 'maximize',
                action: async (): Promise<void> => {
                    const button: HTMLElement | null = container.querySelector(
                        '#open-fullscreen-button'
                    );
                    if (!button) {
                        return;
                    }
                    if (!document.fullscreenElement) {
                        await container.requestFullscreen({
                            navigationUI: 'auto',
                        });
                        updateButton(
                            button,
                            'minimize',
                            'Open in fullscreen mode'
                        );
                    } else {
                        await container.doc.exitFullscreen();
                        updateButton(
                            button,
                            'maximize',
                            'Exit fullscreen mode'
                        );
                    }
                },
                title: 'Open in fullscreen mode',
                id: 'open-fullscreen-button',
            },
        ];

        if (Platform.isMobileApp) {
            buttons.push({
                icon: this.diagram.nativeTouchEventsEnabled
                    ? 'circle-slash-2'
                    : 'hand',
                action: (): void => {
                    this.diagram.nativeTouchEventsEnabled =
                        !this.diagram.nativeTouchEventsEnabled;

                    const btn: HTMLElement | null = this.panel.querySelector(
                        '#native-touch-event'
                    );
                    if (!btn) {
                        return;
                    }

                    const nativeEvents = this.diagram.nativeTouchEventsEnabled;

                    updateButton(
                        btn,
                        this.diagram.nativeTouchEventsEnabled
                            ? 'circle-slash-2'
                            : 'hand',
                        `${nativeEvents ? 'Enable' : 'Disable'} move and pinch zoom`
                    );

                    this.diagram.plugin.showNotice(
                        `Native touches are ${nativeEvents ? 'enabled' : 'disabled'} now. 
            You ${nativeEvents ? 'cannot' : 'can'} move and pinch zoom diagram diagram.`
                    );
                },
                title: `${this.diagram.nativeTouchEventsEnabled ? 'Enable' : 'Disable'} move and pinch zoom`,
                id: 'native-touch-event',
            });
        }

        return buttons;
    }
    /**
     * Creates the HTML element of the service panel.
     *
     * The service panel is a container with absolute positioning that is placed at the top right of the diagram.
     * It contains buttons that provide additional functionality for the diagram.
     * The buttons are created using the `getButtons` method and are then appended to the panel.
     *
     * @returns The HTML element of the service panel.
     */
    createPanel(): HTMLElement {
        const servicePanel = this.diagramControlPanel.createPanel(
            'diagram-service-panel',
            {
                right: '10px',
                top: '10px',
                gridTemplateColumns: 'repeat(2, 1fr)',
            }
        );

        const serviceButtons = this.getButtons(this.diagram.activeContainer!);
        serviceButtons.forEach((btn) =>
            servicePanel.appendChild(
                this.diagramControlPanel.createButton(
                    btn.icon,
                    btn.action,
                    btn.title,
                    true,
                    btn.id
                )
            )
        );

        return servicePanel;
    }
}
