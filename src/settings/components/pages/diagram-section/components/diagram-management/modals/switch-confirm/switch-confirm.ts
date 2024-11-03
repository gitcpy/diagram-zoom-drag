import { App, Modal, Setting } from 'obsidian';

export class SwitchConfirm extends Modal {
    private onSubmit: (result: string) => void;
    constructor(
        app: App,
        diagramName: string,
        onSubmit: (result: string) => void
    ) {
        super(app);
        this.onSubmit = onSubmit;
        this.setTitle(`Editing ${diagramName}...`);
    }

    /**
     * This function is called when the modal is opened.
     * It renders a confirmation dialogue that asks the user if they want to switch the page without saving any unsaved changes.
     * It also provides a button to save the changes and continue to the next page.
     * @returns nothing
     */
    onOpen(): void {
        new Setting(this.contentEl)
            .setName(
                'Are you sure you want to switch the page? You will lose your unsaved changes.'
            )
            .setHeading()
            .addButton((button) => {
                button.setButtonText('Proceed without saving');
                button.onClick((cb) => {
                    this.onSubmit('Yes');
                    this.close();
                });
            })
            .addButton((button) => {
                button.setButtonText('Cancel');
                button.onClick((cb) => {
                    this.onSubmit('No');
                    this.close();
                });
            })
            .addButton((button) => {
                button.setButtonText('Save and continue');
                button.onClick((cb) => {
                    this.onSubmit('Save');
                    this.close();
                });
            });
    }

    /**
     * This method is called when the modal is closed.
     * It empties the content element to prevent a memory leak.
     * @returns nothing
     */
    onClose(): void {
        this.contentEl.empty();
    }
}
