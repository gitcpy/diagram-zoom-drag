import { Diagram } from '../diagram';
import { Export } from './export/export';
import { Menu } from 'obsidian';
import { CopyDiagram } from './copy/copy-diagram';
import { CopyDiagramSource } from './copy/copy-diagram-source';
import { DiagramData } from '../../settings/typing/interfaces';

export class DiagramContextMenu {
    private export: Export;
    private copy: CopyDiagram;
    private copySource: CopyDiagramSource;
    constructor(public readonly diagram: Diagram) {
        this.export = new Export(this);
        this.copy = new CopyDiagram(this);
        this.copySource = new CopyDiagramSource(this);
    }

    initialize(container: HTMLElement, diagramData: DiagramData): void {
        this.diagram.plugin.view?.registerDomEvent(
            container,
            'contextmenu',
            () => {
                container.addEventListener(
                    'contextmenu',
                    (event) => {
                        const target = event.target as HTMLElement;
                        const isThereDiagramContainer: HTMLElement | null =
                            target.closest('.diagram-container');

                        if (!isThereDiagramContainer) {
                            return;
                        }

                        isThereDiagramContainer.focus();

                        event.preventDefault();
                        event.stopPropagation();

                        const menu = new Menu();
                        menu.addItem((item) => {
                            item.setTitle('Export diagram');
                            item.onClick(async () => {
                                this.export.export(
                                    this.diagram.activeContainer!
                                );
                            });
                        });

                        menu.addItem((item) => {
                            item.setTitle('Copy diagram');
                            item.onClick(async () => {
                                await this.copy.copy(
                                    this.diagram.activeContainer!
                                );
                            });
                        });

                        menu.addItem((item) => {
                            item.setTitle('Copy diagram source');
                            item.onClick(async () => {
                                await this.copySource.copy(container);
                            });
                        });

                        menu.showAtMouseEvent(event);
                    },
                    true
                );
            }
        );
    }
}
