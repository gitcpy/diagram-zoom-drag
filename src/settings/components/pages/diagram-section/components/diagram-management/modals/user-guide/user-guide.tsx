import { App, Modal, normalizePath, requestUrl } from 'obsidian';
import DiagramZoomDragPlugin from '../../../../../../../../core/diagram-zoom-drag-plugin';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import Application from './components/Application';

export class UserGuide extends Modal {
    root: Root | undefined = undefined;

    constructor(
        app: App,
        public plugin: DiagramZoomDragPlugin
    ) {
        super(app);
        this.setTitle('Guide');
    }

    async onOpen(): Promise<void> {
        const { contentEl } = this;

        this.root = createRoot(contentEl.createEl('div'));

        this.root.render(<Application modal={this} />);
    }

    onClose(): void {
        this.root?.unmount();
        this.contentEl.empty();
    }

    async loadVideo(): Promise<boolean> {
        const isFirstPluginStart =
            await this.plugin.pluginStateChecker.isFirstPluginStart();

        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            return false;
        }
        const assetsPath = normalizePath(`${pluginDir}/assets`);
        const videoPath = normalizePath(`${assetsPath}/user-guide-video.mp4`);
        const existsAssetsPath =
            await this.app.vault.adapter.exists(assetsPath);

        if (!existsAssetsPath) {
            await this.app.vault.adapter.mkdir(assetsPath);
        }

        if (isFirstPluginStart) {
            await this.downloadVideo(videoPath);
        } else {
            const exist = await this.app.vault.adapter.exists(videoPath);
            if (!exist) {
                await this.downloadVideo(videoPath);
            }
        }

        return this.app.vault.adapter.exists(videoPath);
    }

    private async downloadVideo(videoPath: string): Promise<boolean> {
        try {
            const url =
                'https://raw.githubusercontent.com/gitcpy/diagram-zoom-drag/main/assets/videos/find-class.mp4';
            const response = await requestUrl(url);

            if (!(response.status === 200)) {
                throw new Error(`Error downloading video: ${response.status}`);
            }

            await this.app.vault.adapter.writeBinary(
                videoPath,
                response.arrayBuffer
            );

            return true;
        } catch (err: any) {
            console.error('Error downloading video:', err);
            return false;
        }
    }

    onclose(): void {
        this.root?.unmount();
        this.contentEl.empty();
    }
}
