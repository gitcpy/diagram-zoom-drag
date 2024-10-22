import { App, Modal, normalizePath } from 'obsidian';
import DiagramZoomDragPlugin from '../../core/diagram-zoom-drag-plugin';

export class UserGuideModal extends Modal {
    constructor(
        app: App,
        public plugin: DiagramZoomDragPlugin
    ) {
        super(app);
        this.setTitle('Guide');
    }

    async onOpen(): Promise<void> {
        const { contentEl } = this;

        contentEl.empty();

        const heading = contentEl.createEl('h2', {
            text: 'How to find diagram selectors in DevTools',
        });
        contentEl.appendChild(heading);

        const description = contentEl.createEl('p', {
            text: 'To identify the CSS selectors for diagrams on this page, follow these steps using your browser’s DevTools:',
        });
        contentEl.appendChild(description);

        const stepsHeading = contentEl.createEl('h3', {
            text: 'Steps to Find Selectors:',
        });
        contentEl.appendChild(stepsHeading);

        const stepsList = contentEl.createEl('ol');
        const steps = [
            'Open the markdown view in Obsidian where the diagram is displayed.',
            'Open DevTools by pressing `CTRL` + `SHIFT` + `I` on the keyboard.',
            'Click the "Select an element on this page to inspect it" button (usually a arrow icon) in the top-left corner of the DevTools window.',
            'Move your cursor over the diagram and click on it to select the element.',
            'In the Elements tab of DevTools, you will see the HTML element corresponding to the diagram highlighted.',
            'Look at the classes applied to this element in the DevTools panel to identify the CSS selectors you need.',
        ];

        steps.forEach((step) => {
            const listItem = contentEl.createEl('li', { text: step });
            stepsList.appendChild(listItem);
        });

        contentEl.appendChild(stepsList);

        await this.loadVideo();

        const pluginPath = this.plugin.manifest.dir;
        if (!pluginPath) {
            return;
        }

        const videoPath = normalizePath(
            `${pluginPath}/assets/user-guide-video.mp4`
        );

        try {
            const arrayBuffer =
                await this.app.vault.adapter.readBinary(videoPath);
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:video/mp4;base64,${base64}`;

            const videoEl = this.contentEl.createEl('video', {
                attr: {
                    controls: true,
                    src: dataUrl,
                },
            });
            videoEl.autoplay = false;
            videoEl.style.width = '100%';
            videoEl.style.maxHeight = '400px';
        } catch (error) {
            console.error(error);
            this.plugin.showNotice(
                'Something went wrong. The video is missing.'
            );
        }

        const closeButton = contentEl.createEl('button', { text: 'Close' });
        closeButton.style.position = 'absolute';
        closeButton.style.right = '10px';
        closeButton.style.top = '10px';
        closeButton.addEventListener('click', () => this.close());
        contentEl.appendChild(closeButton);
    }

    onClose(): void {
        this.contentEl.empty();
    }

    private async loadVideo(): Promise<undefined> {
        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            return undefined;
        }
        const assetsPath = normalizePath(`${pluginDir}/assets`);
        const videoPath = normalizePath(`${assetsPath}/user-guide-video.mp4`);
        const existsAssetsPath =
            await this.app.vault.adapter.exists(assetsPath);
        if (!existsAssetsPath) {
            await this.app.vault.adapter.mkdir(assetsPath);
        }

        const isFirstPluginStart =
            await this.plugin.pluginStateChecker.isFirstPluginStart();
        if (isFirstPluginStart) {
            await this.downloadVideo(videoPath);
        } else {
            const exist = await this.app.vault.adapter.exists(videoPath);
            if (!exist) {
                await this.downloadVideo(videoPath);
            }
        }
    }

    private async downloadVideo(videoPath: string): Promise<null | boolean> {
        try {
            const url =
                'https://raw.githubusercontent.com/gitcpy/diagram-zoom-drag/main/assets/videos/find-class.mp4';
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const blob = await response.blob();
            await this.app.vault.adapter.writeBinary(
                videoPath,
                await blob.arrayBuffer()
            );

            return true;
        } catch (err: any) {
            console.error('Error downloading video:', err);
            return null;
        }
    }
}
