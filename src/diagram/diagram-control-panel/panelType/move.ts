import { DiagramControlPanel } from '../diagram-control-panel';
import { Diagram } from '../../diagram';
import { PanelType } from '../typing/interfaces';

export class MovePanel implements PanelType {
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
                icon: 'arrow-up-left',
                action: (): void =>
                    this.diagram.diagramActions.moveElement(
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
                    this.diagram.diagramActions.moveElement(
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
                    this.diagram.diagramActions.moveElement(
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
                    this.diagram.diagramActions.moveElement(
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
                    this.diagram.diagramActions.moveElement(
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
                    this.diagram.diagramActions.moveElement(
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
                    this.diagram.diagramActions.moveElement(
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
                    this.diagram.diagramActions.moveElement(
                        container,
                        -50,
                        -50,
                        true
                    ),
                title: 'Move down right',
            },
        ];
    }

    createPanel(): HTMLElement {
        const panel = this.diagramControlPanel.createPanel(
            ['mermaid-zoom-drag-panel', 'diagram-move-panel'],
            {
                right: '10px',
                bottom: '10px',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
            }
        );

        const moveButtons = this.getButtons(this.diagram.activeContainer!);

        moveButtons.forEach((btn) =>
            panel.appendChild(
                this.diagramControlPanel.createButton(
                    btn.icon,
                    btn.action,
                    btn.title,
                    btn.active,
                    btn.id
                )
            )
        );
        return panel;
    }
}
