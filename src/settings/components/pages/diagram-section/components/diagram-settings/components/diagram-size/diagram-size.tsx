import { ReactObsidianSetting } from 'react-obsidian-setting';
import React, { useState } from 'react';
import { useSettingsContext } from '../../../../../../core/context';
import { ComponentType } from './typing/constanst';

const DiagramSizes: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [expandedHeight, setExpandedHeight] = useState(
        plugin.settings.diagramExpandedHeight
    );
    const [expandedWidth, setExpandedWidth] = useState(
        plugin.settings.diagramExpandedWidth
    );
    const [collapsedHeight, setCollapsedHeight] = useState(
        plugin.settings.diagramCollapsedHeight
    );
    const [collapsedWidth, setCollapsedWidth] = useState(
        plugin.settings.diagramCollapsedWidth
    );

    const isDimensionInValidRange = (dimension: string) => {
        const n = parseInt(dimension, 10);
        return n >= 100 && n <= 1000;
    };

    const isValidNumber = (dimension: string) => dimension.match(/^\d+$/);

    const createSettingInputs = (componentType: ComponentType) => {
        const prefix =
            componentType === ComponentType.Collapsed
                ? 'Collapsed'
                : 'Expanded';
        const height =
            componentType === ComponentType.Collapsed
                ? collapsedHeight
                : expandedHeight;
        const width =
            componentType === ComponentType.Collapsed
                ? collapsedWidth
                : expandedWidth;

        return (
            <>
                <ReactObsidianSetting
                    name={`${prefix} diagram container size`}
                    addMultiDesc={(multiDesc) => {
                        multiDesc.addDescriptions([
                            `Set the container dimensions for ${prefix.toLowerCase()} state in pixels.`,
                            'Click Save button to apply changes.',
                        ]);
                        return multiDesc;
                    }}
                    setHeading={true}
                    noBorder={true}
                />
                <ReactObsidianSetting
                    addTexts={[
                        (inputHeight) => {
                            inputHeight.setValue(height.toString());
                            inputHeight.inputEl.id = `input${prefix.toLowerCase()}Height`;
                            inputHeight.inputEl.type = 'number';
                            inputHeight.inputEl.min = '100';
                            inputHeight.inputEl.max = '1000';
                            inputHeight.inputEl.ariaLabel = `${prefix} height in pixels`;

                            inputHeight.inputEl.onblur = () => {
                                if (!isValidNumber(inputHeight.inputEl.value)) {
                                    plugin.showNotice(
                                        'Please enter valid number'
                                    );
                                    return;
                                }

                                if (
                                    !isDimensionInValidRange(
                                        inputHeight.inputEl.value
                                    )
                                ) {
                                    plugin.showNotice(
                                        'Invalid range. Please enter number in range 100-1000px'
                                    );
                                }
                            };
                            return inputHeight;
                        },
                        (inputWidth) => {
                            inputWidth.setValue(width.toString());
                            inputWidth.inputEl.id = `input${prefix.toLowerCase()}Width`;
                            inputWidth.inputEl.type = 'number';
                            inputWidth.inputEl.min = '100';
                            inputWidth.inputEl.max = '1000';
                            inputWidth.inputEl.ariaLabel = `${prefix} width in pixels`;
                            inputWidth.inputEl.onblur = () => {
                                if (!isValidNumber(inputWidth.inputEl.value)) {
                                    plugin.showNotice(
                                        'Please enter valid number'
                                    );
                                    return;
                                }
                                if (
                                    !isDimensionInValidRange(
                                        inputWidth.inputEl.value
                                    )
                                ) {
                                    plugin.showNotice(
                                        'Invalid range. Please enter number in range 100-1000px'
                                    );
                                }
                            };
                            return inputWidth;
                        },
                    ]}
                    addButtons={[
                        (button) => {
                            button.setIcon('save');
                            button.onClick(async (cb) => {
                                const inputWidth: HTMLInputElement | null =
                                    document.querySelector(
                                        `#input${prefix.toLowerCase()}Width`
                                    );
                                const inputHeight: HTMLInputElement | null =
                                    document.querySelector(
                                        `#input${prefix.toLowerCase()}Height`
                                    );

                                if (!inputWidth || !inputHeight) {
                                    return;
                                }

                                if (
                                    !isValidNumber(inputWidth.value) ||
                                    !isValidNumber(inputHeight.value)
                                ) {
                                    plugin.showNotice(
                                        'Please enter valid numbers'
                                    );
                                    return;
                                }

                                if (
                                    !isDimensionInValidRange(
                                        inputWidth.value
                                    ) ||
                                    !isDimensionInValidRange(inputHeight.value)
                                ) {
                                    plugin.showNotice(
                                        'Invalid range. Please enter number in range 100-1000px'
                                    );
                                    return;
                                }

                                const width = parseInt(inputWidth.value, 10);
                                const height = parseInt(inputHeight.value, 10);

                                if (componentType === ComponentType.Collapsed) {
                                    setCollapsedWidth(width);
                                    setCollapsedHeight(height);
                                    plugin.settings.diagramCollapsedHeight =
                                        height;
                                    plugin.settings.diagramCollapsedWidth =
                                        width;
                                } else {
                                    setExpandedWidth(width);
                                    setExpandedHeight(height);
                                    plugin.settings.diagramExpandedHeight =
                                        height;
                                    plugin.settings.diagramExpandedWidth =
                                        width;
                                }
                                await plugin.settingsManager.saveSettings();
                                plugin.updateCssProperties();
                                plugin.showNotice('Saved successfully');
                            });
                            return button;
                        },
                    ]}
                    noBorder={true}
                />
            </>
        );
    };

    return (
        <>
            {createSettingInputs(ComponentType.Expanded)}
            {createSettingInputs(ComponentType.Collapsed)}
        </>
    );
};

export default DiagramSizes;
