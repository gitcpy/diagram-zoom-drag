import { ContextMenu } from '../context-menu';

export class CopyDiagramSource {
    constructor(private readonly diagramContextMenu: ContextMenu) {}

    async copy(container: HTMLElement) {
        const source = this.diagramContextMenu.diagram.source;

        if (source) {
            await navigator.clipboard.writeText(source);
            this.diagramContextMenu.diagram.plugin.showNotice('Copied');
        }
    }
}
