import { DiagramControlPanel } from '../diagram-control-panel';
import { PanelType } from '../typing/interfaces';
import { Diagram } from '../../diagram';

export class ZoomPanel implements PanelType {
    panel!: HTMLElement;
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
        return [
            {
                icon: 'zoom-in',
                action: (): void =>
                    this.diagram.diagramActions.zoomElement(
                        container,
                        1.1,
                        true
                    ),
                title: 'Zoom In',
            },
            {
                icon: 'refresh-cw',
                action: (): void =>
                    this.diagram.diagramActions.resetZoomAndMove(
                        container,
                        true
                    ),
                title: 'Reset Zoom and Position',
            },
            {
                icon: 'zoom-out',
                action: (): void =>
                    this.diagram.diagramActions.zoomElement(
                        container,
                        0.9,
                        true
                    ),
                title: 'Zoom Out',
            },
        ];
    }
    createPanel() {
        const zoomPanel = this.diagramControlPanel.createPanel(
            ['mermaid-zoom-drag-panel', 'diagram-zoom-panel'],
            {
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                gridTemplateColumns: '1fr',
            }
        );

        const zoomButtons = this.getButtons(this.diagram.activeContainer!);
        zoomButtons.forEach((btn) =>
            zoomPanel.appendChild(
                this.diagramControlPanel.createButton(
                    btn.icon,
                    btn.action,
                    btn.title,
                    true
                )
            )
        );

        return zoomPanel;
    }
}
