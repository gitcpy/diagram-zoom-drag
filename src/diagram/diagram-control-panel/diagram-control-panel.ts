import { Diagram } from '../diagram';
import { setIcon } from 'obsidian';
import { MovePanel } from './panelType/move';
import { ZoomPanel } from './panelType/zoom';
import { FoldPanel } from './panelType/fold';
import { ServicePanel } from './panelType/service';
import { EventID } from '../../events-management/typing/constants';
import { PanelsChangedVisibility } from '../../events-management/typing/interface';
import { updateButton } from '../../helpers/helpers';

export class DiagramControlPanel {
    constructor(public diagram: Diagram) {}

    initialize(container: HTMLElement): void {
        this.diagram.activeContainer = container;

        const controlPanel = container.createDiv();

        const move = new MovePanel(this.diagram, this);
        const zoom = new ZoomPanel(this.diagram, this);
        const fold = new FoldPanel(this.diagram, this);
        const service = new ServicePanel(this.diagram, this);

        this.diagram.diagramState.initializeContainerPanels(
            this.diagram.plugin.leafID!,
            this.diagram.activeContainer.id,
            controlPanel,
            move,
            fold,
            zoom,
            service
        );

        [move, zoom, fold, service].forEach((panel) => {
            panel.initialize();
        });

        if (
            this.diagram.plugin.settings.hideOnMouseOutDiagram ||
            this.diagram.plugin.settings.hideOnMouseOutPanels ||
            this.diagram.activeContainer?.hasClass('folded')
        ) {
            [move, zoom, service].forEach((panel) => {
                panel.panel.removeClass('visible');
                panel.panel.addClass('hidden');
            });
        }

        const hidingB: HTMLElement | null = service.panel.querySelector(
            '#hide-show-button-diagram'
        );

        this.diagram.plugin.observer.subscribe(
            this.diagram.plugin.app.workspace,
            EventID.PanelsChangedVisibility,
            async (e: PanelsChangedVisibility) => {
                const visible = e.data.visible;
                if (!hidingB) {
                    return;
                }
                service.hiding = !visible;
                updateButton(
                    hidingB,
                    service.hiding ? 'eye-off' : 'eye',
                    `${service.hiding ? 'Show' : 'Hide'} move and zoom panels`
                );
                setIcon(hidingB, service.hiding ? 'eye-off' : 'eye');
            }
        );

        this.diagram.activeContainer?.appendChild(controlPanel);
    }

    createPanel(classes: string[], styles: object): HTMLElement {
        const controlPanel =
            this.diagram.diagramState.containersPanels?.controlPanel;
        const panel = controlPanel!.createEl('div');
        panel.addClasses(classes);
        panel.addClass('mermaid-zoom-drag-panel');
        panel.setCssStyles(styles);
        return panel;
    }

    createButton(
        icon: string,
        action: () => void,
        title: string,
        active = true,
        id: string | undefined = undefined
    ): HTMLElement {
        const button = document.createElement('button');
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
            });
            setIcon(button, icon);

            this.diagram.plugin.view!.registerDomEvent(button, 'click', action);

            this.diagram.plugin.view!.registerDomEvent(
                button,
                'mouseenter',
                () => {
                    button.setCssStyles({
                        color: 'var(--interactive-accent)',
                    });
                }
            );

            this.diagram.plugin.view!.registerDomEvent(
                button,
                'mouseleave',
                () => {
                    button.setCssStyles({
                        color: 'var(--text-muted)',
                    });
                }
            );
        } else {
            button.setCssStyles({
                visibility: 'hidden',
            });
        }

        button.setAttribute('aria-label', title);
        return button;
    }
}
