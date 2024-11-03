import { ControlPanel } from '../control-panel';
import { Diagram } from '../../diagram';
import { PanelType } from '../typing/interfaces';

export class MovePanel implements PanelType {
    panel!: HTMLElement;
    constructor(
        private readonly diagram: Diagram,
        private readonly diagramControlPanel: ControlPanel
    ) {}

    /**
     * Initializes the move panel.
     *
     * This method creates the HTML element of the move panel and assigns it to the `panel` property.
     */
    initialize(): void {
        this.panel = this.createPanel();
    }

    /**
     * Returns an array of objects representing the buttons in the move panel.
     *
     * The buttons are objects with the following properties:
     * - `icon`: The icon to display in the button.
     * - `action`: The action to perform when the button is clicked.
     * - `title`: The title of the button.
     * - `active`: Whether the button is active or not.
     * - `id`: The id of the button.
     *
     * The move panel has 8 buttons, each of which moves the container in a different direction.
     *
     * @param container The container to which the move panel is attached.
     * @returns An array of objects representing the buttons in the move panel.
     */
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
                    this.diagram.actions.moveElement(container, 50, 50, true),
                title: 'Move up left',
            },
            {
                icon: 'arrow-up',
                action: (): void =>
                    this.diagram.actions.moveElement(container, 0, 50, true),
                title: 'Move up',
            },
            {
                icon: 'arrow-up-right',
                action: (): void =>
                    this.diagram.actions.moveElement(container, -50, 50, true),
                title: 'Move up right',
            },
            {
                icon: 'arrow-left',
                action: (): void =>
                    this.diagram.actions.moveElement(container, 50, 0, true),
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
                    this.diagram.actions.moveElement(container, -50, 0, true),
                title: 'Move right',
            },
            {
                icon: 'arrow-down-left',
                action: (): void =>
                    this.diagram.actions.moveElement(container, 50, -50, true),
                title: 'Move down left',
            },
            {
                icon: 'arrow-down',
                action: (): void =>
                    this.diagram.actions.moveElement(container, 0, -50, true),
                title: 'Move down',
            },
            {
                icon: 'arrow-down-right',
                action: (): void =>
                    this.diagram.actions.moveElement(container, -50, -50, true),
                title: 'Move down right',
            },
        ];
    }

    /**
     * Creates the HTML element of the move panel.
     *
     * The move panel is a container with absolute positioning that is placed at the bottom right of the diagram.
     * It contains 8 buttons that move the currently selected container in the diagram.
     * The buttons are created using the `getButtons` method and are then appended to the panel.
     *
     * @returns The HTML element of the move panel.
     */
    createPanel(): HTMLElement {
        const panel = this.diagramControlPanel.createPanel(
            'diagram-move-panel',
            {
                ...this.diagram.plugin.settings.panelsConfig.move.position,
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
