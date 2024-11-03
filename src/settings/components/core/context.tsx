import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { App } from 'obsidian';
import DiagramZoomDragPlugin from '../../../core/diagram-zoom-drag-plugin';

interface SettingsContextProps {
    plugin: DiagramZoomDragPlugin;
    app: App;
    forceReload: () => void;
    reloadCount: number;
    currentPath: string;
    setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
    undefined
);

interface SettingProviderProps {
    app: App;
    plugin: DiagramZoomDragPlugin;
    children: React.ReactNode;
}

/**
 * Provides the Obsidian app, the plugin instance, a force reload function,
 * the reload count, the current path, and a function to set the current path
 * to its children.
 *
 * @param app The Obsidian app instance.
 * @param plugin The plugin instance.
 * @param children The children components of the provider.
 * @returns The children components wrapped in the context provider.
 */
export const SettingProvider = ({
    app,
    plugin,
    children,
}: SettingProviderProps): React.ReactElement => {
    const [reloadCount, setReloadCount] = useState(0);
    const [currentPath, setCurrentPath] = useState<string>('/diagram-section');

    const forceReload = useCallback(() => {
        setReloadCount((prev) => prev + 1);
    }, []);

    const contextValue: SettingsContextProps = useMemo(
        () => ({
            app,
            plugin,
            forceReload,
            reloadCount,
            currentPath,
            setCurrentPath,
        }),
        [app, plugin, forceReload, reloadCount, currentPath, setCurrentPath]
    );

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

/**
 * A React hook that returns the `SettingsContextProps` object.
 *
 * This hook should be used within a `SettingProvider` component. If used
 * outside of a `SettingProvider`, it will throw an error.
 *
 * @returns The `SettingsContextProps` object.
 */
export const useSettingsContext = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error(
            'useSettingsContext must be used within a SettingProvider'
        );
    }
    return context;
};
