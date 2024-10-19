import { PanelType } from '../typing/interfaces';
import { Diagram } from '../../diagram';
import { DiagramControlPanel } from '../diagram-control-panel';

export class FoldPanel implements PanelType {
    private panel!: HTMLElement;

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
                icon: 'fold-vertical',
                action: (): void => {
                    container.classList.toggle('folded');
                },
                title: 'Fold diagram',
                id: 'diagram-fold-button',
            },
        ];
    }

    createPanel(): HTMLElement {
        const foldPanel = this.diagramControlPanel.createPanel(
            ['mermaid-zoom-drag-panel', 'diagram-fold-panel'],
            {
                position: 'absolute',
                left: '50%',
                bottom: '0',
                transform: 'translateX(-50%)',
                gridTemplateColumns: '1fr',
            }
        );

        const foldButtons = this.getButtons(this.diagram.activeContainer!);

        foldButtons.forEach((button) => {
            const btn = this.diagramControlPanel.createButton(
                button.icon,
                button.action,
                button.title,
                true,
                button.id
            );
            foldPanel.appendChild(btn);
        });

        return foldPanel;
    }
}
