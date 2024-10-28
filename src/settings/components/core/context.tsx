import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
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

export const SettingProvider = ({
    app,
    plugin,
    children,
}: SettingProviderProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [reloadCount, setReloadCount] = useState(0);
    const [currentPath, setCurrentPath] = useState<string>('/general');

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

export const useSettingsContext = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error(
            'useSettingsContext must be used within a SettingProvider'
        );
    }
    return context;
};
