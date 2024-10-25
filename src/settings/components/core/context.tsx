import React, {
    createContext,
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
    ref: React.RefObject<HTMLDivElement>;
    currentTab: string;
    setCurrentTab: (value: string | ((prev: string) => string)) => void;
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
    const [currentTab, setCurrentTab] = useState<string>('general');

    const contextValue: SettingsContextProps = useMemo(
        () => ({
            app,
            plugin,
            ref,
            currentTab,
            setCurrentTab,
        }),
        [app, plugin, ref, currentTab]
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
