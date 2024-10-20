import { Setting } from 'obsidian';
import DiagramZoomDragPlugin from '../../core/diagram-zoom-drag-plugin';
import { EventID } from '../../events-management/typing/constants';
import { ItemsPerPageChanged } from '../../events-management/typing/interface';

export class DiagramSettingsManager {
    private readonly plugin: DiagramZoomDragPlugin;
    private readonly containerEl: HTMLElement;
    private diagramsPerPage: number;
    private currentPage: number;
    private totalPages: number;

    constructor(plugin: DiagramZoomDragPlugin, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.containerEl = containerEl;
        this.diagramsPerPage = this.plugin.settings.diagramsPerPage;
        this.currentPage = 1;
        this.totalPages = 1;

        this.setupEventListeners();
    }

    /**
     * Asynchronously renders the pagination and list containers.
     *
     * @returns A Promise that resolves when the rendering is complete.
     */
    async render(): Promise<void> {
        this.containerEl.empty();

        const paginationContainer = this.containerEl.createDiv('pagination');
        paginationContainer.addClass('pagination-container');

        const listContainer = this.containerEl.createDiv('list-container');

        this.renderPagination(paginationContainer);
        this.renderList(listContainer);
    }

    /**
     * Renders the pagination controls and page information.
     *
     * @param container The container element to render the pagination controls in.
     */
    private renderPagination(container: HTMLElement): void {
        container.empty();
        this.totalPages = Math.ceil(
            this.plugin.settings.supported_diagrams.length /
                this.diagramsPerPage
        );

        const prevButton = container.createEl('button', { text: '←' });
        prevButton.ariaLabel = 'Go to previous page';
        const pageInfo = container.createSpan({
            text: `Page ${this.currentPage} of ${this.totalPages} (Total diagrams: ${this.plugin.settings.supported_diagrams.length})`,
        });
        const nextButton = container.createEl('button', { text: '→' });
        nextButton.ariaLabel = 'Go to next page';

        prevButton.onclick = (): Promise<void> => this.changePage(-1);
        nextButton.onclick = (): Promise<void> => this.changePage(1);
    }

    /**
     * Renders the list of diagrams in the specified container.
     *
     * @param container The container element to render the list of diagrams in.
     */
    private renderList(container: HTMLElement): void {
        container.empty();
        const startIndex = (this.currentPage - 1) * this.diagramsPerPage;
        const endIndex = startIndex + this.diagramsPerPage;
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

    /**
     * Deletes a diagram at the specified index from the supported diagrams list.
     * Updates the current page to ensure it remains valid after deletion.
     * Saves the updated settings and re-renders the diagram list.
     *
     * @param index - The index of the diagram to be deleted.
     * @returns A promise that resolves when the diagram is deleted and changes are saved.
     */
    private async deleteDiagram(index: number): Promise<void> {
        const settings = this.plugin.settings;
        settings.supported_diagrams.splice(index, 1);
        await this.plugin.settingsManager.saveSettings();

        this.currentPage = Math.min(
            this.currentPage,
            Math.ceil(settings.supported_diagrams.length / this.diagramsPerPage)
        );

        if (this.currentPage === 0 && settings.supported_diagrams.length > 0) {
            this.currentPage = 1;
        }

        await this.render();
    }

    /**
     * Updates the current page based on the specified delta.
     * If the resulting current page is less than 1, sets it to 1.
     * If the resulting current page is greater than the total number of pages, sets it to the total number of pages.
     * Finally, triggers a re-render of the page.
     *
     * @param delta - The amount by which to update the current page.
     * @returns A promise that resolves once the page is updated and re-rendered.
     */
    private async changePage(delta: number): Promise<void> {
        this.currentPage = Math.min(
            this.totalPages,
            Math.max(this.currentPage + delta, 1)
        );

        await this.render();
    }

    /**
     * Sets up event listeners for handling changes in the number of items per page.
     * Updates the current page and triggers a re-render of the page based on the changes.
     */
    setupEventListeners(): void {
        this.plugin.observer.subscribe(
            this.plugin.app.workspace,
            EventID.ItemsPerPageChanged,
            async (event: ItemsPerPageChanged) => {
                this.diagramsPerPage = this.plugin.settings.diagramsPerPage;
                this.currentPage = Math.min(
                    this.currentPage,
                    Math.ceil(
                        this.plugin.settings.supported_diagrams.length /
                            this.diagramsPerPage
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
