import DiagramZoomDragPlugin from './diagram-zoom-drag-plugin';

export default class PluginStateChecker {
    constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Determines if the plugin is being opened for the first time.
     *
     * Compares current plugin metadata with stored metadata in local storage. Updates local storage if it's the first launch.
     *
     * @returns `true` if it's the first time the plugin is opened, otherwise `false`.
     */
    async isFirstPluginStart(): Promise<boolean> {
        const pluginMetadata = await this.getPluginMetadata();

        const localStoragePluginMetadata = localStorage.getItem(
            'mermaid-zoom-drag-metadata'
        );

        if (!localStoragePluginMetadata) {
            localStorage.setItem(
                'mermaid-zoom-drag-metadata',
                pluginMetadata.toString()
            );
            return true;
        }
        const localStoragePluginMetadataNumber = parseInt(
            localStoragePluginMetadata,
            10
        );

        if (
            isNaN(localStoragePluginMetadataNumber) ||
            pluginMetadata !== localStoragePluginMetadataNumber
        ) {
            localStorage.setItem(
                'mermaid-zoom-drag-metadata',
                pluginMetadata.toString()
            );
            return true;
        }
        return false;
    }

    /**
     * Retrieves metadata for the plugin based on its directory creation time.
     *
     * Constructs the path to the plugin directory, retrieves its stats, and returns the directory's creation time in milliseconds.
     *
     * @returns {Promise<number>} A promise that resolves to the plugin directory's creation time in milliseconds.
     * @throws {Error} Throws an error if the plugin directory is not found.
     */
    private async getPluginMetadata(): Promise<number> {
        // @ts-ignore
        const { dir: pluginDir } = this.plugin.manifest;

        if (!pluginDir) {
            throw new Error('No plugin dir found.');
        }

        const pluginDirStat =
            await this.plugin.app.vault.adapter.stat(pluginDir);
        return pluginDirStat?.ctime || 0;
    }
}
