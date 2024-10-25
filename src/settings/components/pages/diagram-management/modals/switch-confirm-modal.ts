import { App, Modal, Setting } from 'obsidian';
import { Root } from 'react-dom/client';

export class SwitchConfirmModal extends Modal {
    private onSubmit: (result: string) => void;
    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
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

    onClose() {
        this.contentEl.empty();
    }
}
