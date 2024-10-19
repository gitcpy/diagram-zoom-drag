import { Setting } from 'obsidian';
import DiagramZoomDragPlugin from '../../core/diagram-zoom-drag-plugin';
import { EventID } from '../../events-management/typing/constants';
import { ItemsPerPageChanged } from '../../events-management/typing/interface';

export class DiagramSettingsManager {
    private plugin: DiagramZoomDragPlugin;
    private containerEl: HTMLElement;
    private itemsPerPage: number;
    private currentPage: number;
    private totalPages: number;

    constructor(
        plugin: DiagramZoomDragPlugin,
        containerEl: HTMLElement,
        itemsPerPage = 5
    ) {
        this.plugin = plugin;
        this.containerEl = containerEl;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalPages = 1;

        this.setupEventListeners();
    }

    async render(): Promise<void> {
        this.containerEl.empty();

        const paginationContainer = this.containerEl.createDiv('pagination');
        paginationContainer.addClass('pagination-container');

        const listContainer = this.containerEl.createDiv('list-container');

        this.renderPagination(paginationContainer);
        this.renderList(listContainer);
    }

    private renderPagination(container: HTMLElement): void {
        container.empty();
        this.totalPages = Math.ceil(
            this.plugin.settings.supported_diagrams.length / this.itemsPerPage
        );

        const prevButton = container.createEl('button', { text: 'Previous' });
        const pageInfo = container.createSpan({
            text: `Page ${this.currentPage} of ${this.totalPages}`,
        });
        const nextButton = container.createEl('button', { text: 'Next' });

        prevButton.onclick = () => this.changePage(-1);
        nextButton.onclick = () => this.changePage(1);
    }

    private renderList(container: HTMLElement): void {
        container.empty();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const diagrams = this.plugin.settings.supported_diagrams.slice(
            startIndex,
            endIndex
        );

        diagrams.forEach((diagram, index) => {
            new Setting(container)
                .setName(diagram.name)
                .setDesc(diagram.selector)
                .addButton((button) => {
                    button.setIcon('trash');
                    button.setTooltip('Delete this diagram?');
                    button.onClick(async () => {
                        await this.deleteDiagram(startIndex + index);
                    });
                });
        });
    }

    private async deleteDiagram(index: number): Promise<void> {
        const settings = this.plugin.settings;
        settings.supported_diagrams.splice(index, 1);
        await this.plugin.settingsManager.saveSettings();

        this.currentPage = Math.min(
            this.currentPage,
            Math.ceil(settings.supported_diagrams.length / this.itemsPerPage)
        );
        if (this.currentPage === 0 && settings.supported_diagrams.length > 0) {
            this.currentPage = 1;
        }

        await this.render();
    }

    private async changePage(delta: number): Promise<void> {
        this.currentPage += delta;
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        await this.render();
    }

    setupEventListeners(): void {
        this.plugin.observer.subscribe(
            this.plugin.app.workspace,
            EventID.ItemsPerPageChanged,
            async (event: ItemsPerPageChanged) => {
                this.itemsPerPage = this.plugin.settings.itemsPerPage;
                this.currentPage = Math.min(
                    this.currentPage,
                    Math.ceil(
                        this.plugin.settings.supported_diagrams.length /
                            this.itemsPerPage
                    )
                );
                if (
                    this.currentPage === 0 &&
                    this.plugin.settings.supported_diagrams.length > 0
                ) {
                    this.currentPage = 1;
                }
                await this.render();
            }
        );
    }
}
