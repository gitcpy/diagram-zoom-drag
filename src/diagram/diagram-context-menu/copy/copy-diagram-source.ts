import { DiagramContextMenu } from '../diagram-context-menu';

export class CopyDiagramSource {
    constructor(private readonly diagramContextMenu: DiagramContextMenu) {}

    async copy(container: HTMLElement) {
        const state = this.diagramContextMenu.diagram.state;

        const source = state.containerSource;

        if (source) {
            await navigator.clipboard.writeText(source);
            this.diagramContextMenu.diagram.plugin.showNotice('Copied');
        }
    }
}
