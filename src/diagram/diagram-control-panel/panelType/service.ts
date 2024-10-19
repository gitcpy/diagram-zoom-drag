import { PanelType } from '../typing/interfaces';
import { Notice, Platform, setIcon } from 'obsidian';
import { updateButton } from '../../../helpers/helpers';
import { Diagram } from '../../diagram';
import { DiagramControlPanel } from '../diagram-control-panel';

export class ServicePanel implements PanelType {
    panel!: HTMLElement;
    hiding: boolean = false;

    constructor(
        public diagram: Diagram,
        public diagramControlPanel: DiagramControlPanel
    ) {}

    initialize(): void {
        this.panel = this.createPanel();
    }
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
                    this.hiding = !this.hiding;
                    const panels = this.diagram.diagramState.containersPanels;

                    if (!panels) {
                        return;
                    }

                    [panels.panels.move, panels.panels.zoom].forEach(
                        (panel) => {
                            if (this.hiding) {
                                panel.panel.addClass('hidden');
                                panel.panel.removeClass('visible');
                            } else {
                                panel.panel.removeClass('hidden');
                                panel.panel.addClass('visible');
                            }
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
                        this.hiding ? 'eye' : 'eye-off',
                        `${this.hiding ? 'Show' : 'Hide'} move and zoom panels`
                    );
                },
                title: `Hide move and zoom panels`,
                id: 'hide-show-button-diagram',
            },
            {
                icon: 'maximize',
                action: async (): Promise<void> => {
                    const button = container.querySelector(
                        '#open-fullscreen-button'
                    ) as HTMLElement | null;
                    if (!button) {
                        return;
                    }
                    if (!container.doc.fullscreenElement) {
                        await container.requestFullscreen({
                            navigationUI: 'auto',
                        });
                        setIcon(button, 'minimize');
                    } else {
                        await container.doc.exitFullscreen();
                        setIcon(button, 'maximize');
                    }
                },
                title: 'Open in fullscreen mode',
                id: 'open-fullscreen-button',
            },
        ];

        if (Platform.isMobile) {
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

                    new Notice(
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
    createPanel(): HTMLElement {
        const servicePanel = this.diagramControlPanel.createPanel(
            ['mermaid-zoom-drag-panel', 'diagram-service-panel'],
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

    private setupFullscreenEventHandler() {
        const container = this.diagram.activeContainer!;
        const fullScreenKeyboardHandler = (event: KeyboardEvent): void => {
            return this.diagram.diagramEvents.keyboard.keyDown(
                container,
                event
            );
        };
        container.onfullscreenchange = (): void => {
            const fullscreenEl = document.querySelector(
                '.obsidian-app'
            ) as HTMLElement;
            if (container === document.fullscreenElement) {
                container.addClass('is-fullscreen');
                this.diagram.plugin.view!.registerDomEvent(
                    fullscreenEl,
                    'keydown',
                    fullScreenKeyboardHandler
                );
            } else {
                container.removeClass('is-fullscreen');
                fullscreenEl.removeEventListener(
                    'keydown',
                    fullScreenKeyboardHandler
                );
                container.focus();
            }
        };
    }
}
