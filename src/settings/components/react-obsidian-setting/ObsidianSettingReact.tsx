import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import {
    ButtonComponent,
    DropdownComponent,
    ExtraButtonComponent,
    MomentFormatComponent,
    SearchComponent,
    Setting as ObsidianSetting,
    SliderComponent,
    TextAreaComponent,
    TextComponent,
    ToggleComponent,
} from 'obsidian';
import { MultiDescComponent } from './MultiDescComponent';

type ButtonCallback = (button: ButtonComponent) => ButtonComponent;
type DropdownCallback = (dropdown: DropdownComponent) => DropdownComponent;
type ExtraButtonCallback = (
    button: ExtraButtonComponent
) => ExtraButtonComponent;
type AddMomentFormatCallback = (
    momentFormat: MomentFormatComponent
) => MomentFormatComponent;
type AddSearchCallback = (search: SearchComponent) => SearchComponent;
type AddSliderCallback = (slider: SliderComponent) => SliderComponent;
type AddTextCallback = (text: TextComponent) => TextComponent;
type AddTextAreaCallback = (textArea: TextAreaComponent) => TextAreaComponent;
type AddToggleCallback = (toggle: ToggleComponent) => ToggleComponent;
type AddMultiDescCallback = (desc: MultiDescComponent) => MultiDescComponent;

interface PrioritizedElement<T> {
    callback: T;
    priority: number;
}

interface ReactSetting extends ObsidianSetting {
    infoEl: HTMLDivElement;
    settingEl: HTMLDivElement;
}

interface SettingProps {
    addButtons?: (
        | ButtonCallback
        | PrioritizedElement<ButtonCallback>
        | undefined
        | false
    )[];
    addDropdowns?: (
        | DropdownCallback
        | PrioritizedElement<DropdownCallback>
        | undefined
        | false
    )[];
    addExtraButtons?: (
        | ExtraButtonCallback
        | PrioritizedElement<ExtraButtonCallback>
        | undefined
        | false
    )[];
    addMomentFormats?: (
        | AddMomentFormatCallback
        | PrioritizedElement<AddMomentFormatCallback>
        | undefined
        | false
    )[];
    addSearches?: (
        | AddSearchCallback
        | PrioritizedElement<AddSearchCallback>
        | undefined
        | false
    )[];
    addSliders?: (
        | AddSliderCallback
        | PrioritizedElement<AddSliderCallback>
        | undefined
        | false
    )[];
    addTexts?: (
        | AddTextCallback
        | PrioritizedElement<AddTextCallback>
        | undefined
        | false
    )[];
    addTextAreas?: (
        | AddTextAreaCallback
        | PrioritizedElement<AddTextAreaCallback>
        | undefined
        | false
    )[];
    addToggles?: (
        | AddToggleCallback
        | PrioritizedElement<AddToggleCallback>
        | undefined
        | false
    )[];
    addMultiDesc?:
        | AddMultiDescCallback
        | PrioritizedElement<AddMultiDescCallback>
        | undefined
        | false;
    class?: string;
    desc?: string;
    name?: string;
    setHeading?: boolean;
}

function sortByPriority<T>(
    elements: (T | PrioritizedElement<T> | false | undefined)[]
): T[] {
    return elements
        .filter(
            (element): element is T | PrioritizedElement<T> =>
                element !== undefined && element !== false
        )
        .map((element, index) => ({
            callback: isPrioritizedElement(element)
                ? element.callback
                : element,
            priority: isPrioritizedElement(element) ? element.priority : index,
            originalIndex: index,
        }))
        .sort((a, b) => {
            if (a.priority === b.priority) {
                return a.originalIndex - b.originalIndex;
            }
            return a.priority - b.priority;
        })
        .map(({ callback }) => callback as T);
}

function isPrioritizedElement<T>(
    element: T | PrioritizedElement<T>
): element is PrioritizedElement<T> {
    return (element as PrioritizedElement<T>).priority !== undefined;
}

export const ReactObsidianSetting: React.FC<SettingProps> = ({
    name,
    desc,
    setHeading,
    class: className,
    addToggles,
    addTexts,
    addTextAreas,
    addMomentFormats,
    addDropdowns,
    addSearches,
    addButtons,
    addExtraButtons,
    addSliders,
    addMultiDesc,
}) => {
    const settingRef = React.useRef<ReactSetting>();
    const containerRef = React.useRef<HTMLDivElement>(null);

    const setupElements = useCallback(
        <T,>(
            elements:
                | (T | PrioritizedElement<T> | undefined | false)[]
                | undefined,
            addFunction: (setting: ReactSetting, callback: T) => void
        ) => {
            if (!elements?.length) {
                return;
            }

            const sortedCallbacks = sortByPriority(elements);
            return (setting: ReactSetting) => {
                sortedCallbacks.forEach((callback) =>
                    addFunction(setting, callback)
                );
            };
        },
        []
    );

    const setupToggles = useCallback(
        (setting: ReactSetting) => {
            setupElements(addToggles, (s, callback) => s.addToggle(callback))?.(
                setting
            );
        },
        [addToggles, setupElements]
    );

    const setupButtons = useCallback(
        (setting: ReactSetting) => {
            setupElements(addButtons, (s, callback) => s.addButton(callback))?.(
                setting
            );
        },
        [addButtons, setupElements]
    );

    const setupTexts = useCallback(
        (setting: ReactSetting) => {
            setupElements(addTexts, (s, callback) => s.addText(callback))?.(
                setting
            );
        },
        [addTexts, setupElements]
    );

    const setupTextAreas = useCallback(
        (setting: ReactSetting) => {
            setupElements(addTextAreas, (s, callback) =>
                s.addTextArea(callback)
            )?.(setting);
        },
        [addTextAreas, setupElements]
    );

    const setupMomentFormats = useCallback(
        (setting: ReactSetting) => {
            setupElements(addMomentFormats, (s, callback) =>
                s.addMomentFormat(callback)
            )?.(setting);
        },
        [addMomentFormats, setupElements]
    );

    const setupDropdowns = useCallback(
        (setting: ReactSetting) => {
            setupElements(addDropdowns, (s, callback) =>
                s.addDropdown(callback)
            )?.(setting);
        },
        [addDropdowns, setupElements]
    );

    const setupSearches = useCallback(
        (setting: ReactSetting) => {
            setupElements(addSearches, (s, callback) =>
                s.addSearch(callback)
            )?.(setting);
        },
        [addSearches, setupElements]
    );

    const setupExtraButtons = useCallback(
        (setting: ReactSetting) => {
            setupElements(addExtraButtons, (s, callback) =>
                s.addExtraButton(callback)
            )?.(setting);
        },
        [addExtraButtons, setupElements]
    );

    const setupSliders = useCallback(
        (setting: ReactSetting) => {
            setupElements(addSliders, (s, callback) => s.addSlider(callback))?.(
                setting
            );
        },
        [addSliders, setupElements]
    );

    const setupMultiDesc = useCallback(
        (setting: ReactSetting) => {
            if (!addMultiDesc) {
                return;
            }

            const callback = isPrioritizedElement(addMultiDesc)
                ? addMultiDesc.callback
                : addMultiDesc;

            const descContainer = document.createElement('div');
            descContainer.addClass('setting-item-description');

            if (setting.infoEl) {
                setting.infoEl.appendChild(descContainer);
            }

            const multiDesc = new MultiDescComponent({
                containerEl: descContainer,
            });

            callback(multiDesc);
        },
        [addMultiDesc]
    );

    const setupSetting = useCallback(
        (setting: ReactSetting) => {
            if (name) {
                setting.setName(name);
            }
            if (desc) {
                setting.setDesc(desc);
            }
            if (setHeading) {
                setting.setHeading();
            }
            if (className) {
                setting.setClass(className);
            }

            setupTexts(setting);
            setupTextAreas(setting);
            setupToggles(setting);
            setupMultiDesc(setting);
            setupButtons(setting);
            setupMomentFormats(setting);
            setupDropdowns(setting);
            setupSearches(setting);
            setupExtraButtons(setting);
            setupSliders(setting);
        },
        [
            name,
            desc,
            setHeading,
            className,
            setupToggles,
            setupButtons,
            setupTexts,
            setupTextAreas,
            setupMomentFormats,
            setupDropdowns,
            setupSearches,
            setupExtraButtons,
            setupSliders,
            setupMultiDesc,
        ]
    );

    useLayoutEffect(() => {
        if (!containerRef.current) {
            return;
        }

        containerRef.current.empty();
        settingRef.current = new ObsidianSetting(
            containerRef.current
        ) as ReactSetting;
        setupSetting(settingRef.current);

        return () => {
            containerRef.current?.empty();
        };
    }, [setupSetting]);

    return <div ref={containerRef} />;
};
