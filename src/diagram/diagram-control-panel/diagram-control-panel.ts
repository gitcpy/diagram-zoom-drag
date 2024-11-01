import { Diagram } from '../diagram';
import { MovePanel } from './panelType/move';
import { ZoomPanel } from './panelType/zoom';
import { FoldPanel } from './panelType/fold';
import { ServicePanel } from './panelType/service';
import { updateButton } from '../../helpers/helpers';
import { DiagramData } from '../../settings/typing/interfaces';

export class DiagramControlPanel {
    constructor(public diagram: Diagram) {}

    initialize(container: HTMLElement, diagramData: DiagramData): void {
        this.diagram.activeContainer = container;

        const controlPanel = container.createDiv();
        controlPanel.addClass('diagram-zoom-drag-control-panel');

        const move = new MovePanel(this.diagram, this);
        const zoom = new ZoomPanel(this.diagram, this);
        const fold = new FoldPanel(this.diagram, this);
        const service = new ServicePanel(this.diagram, this);

        this.diagram.state.initializeContainerPanels(
            controlPanel,
            move,
            fold,
            zoom,
            service
        );

        fold.initialize();

        if (
            this.diagram.plugin.settings.panelsConfig.move.enabled &&
            diagramData.panels.move.on
        ) {
            move.initialize();
        }

        if (
            this.diagram.plugin.settings.panelsConfig.zoom.enabled &&
            diagramData.panels.zoom.on
        ) {
            zoom.initialize();
        }

        if (
            this.diagram.plugin.settings.panelsConfig.service.enabled &&
            diagramData.panels.service.on
        ) {
            service.initialize();
        }

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

        this.diagram.activeContainer?.appendChild(controlPanel);
    }

    createPanel(cssClass: string, styles: object): HTMLElement {
        const controlPanel = this.diagram.panelsData?.controlPanel;
        const panel = controlPanel!.createEl('div');
        panel.addClass(cssClass);
        panel.addClass('diagram-zoom-drag-panel');
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
            updateButton(button, icon, title);

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

        return button;
    }
}
