import React, { useEffect, useState } from 'react';
import { useSettingsContext } from '../../../../../../core/context';
import { ButtonContainer, PaginationButton } from './styled/styled';
import {
    ButtonComponent,
    ExtraButtonComponent,
    TextComponent,
    ToggleComponent,
} from 'obsidian';
import { EventID } from '../../../../../../../../events-management/typing/constants';
import {
    preEndValidateDiagram,
    validateName,
    validateSelector,
} from '../../helpers/helpers';
import { SwitchConfirm } from '../../modals/switch-confirm/switch-confirm';
import { DiagramSetConfrols } from '../../modals/diagram-set-controls/diagram-set-confrols';
import { ReactObsidianSetting } from 'react-obsidian-setting';

/**
 * The `DiagramPagination` component is used to show a paginated list of diagrams to the user.
 * It allows the user to navigate through the list of diagrams, and to edit or delete the diagrams.
 *
 * @param props - The props passed to the component.
 * @returns The JSX element representing the component.
 */
const DiagramPagination: React.FC = () => {
    const { app, plugin } = useSettingsContext();

    const [editingIndex, setEditingIndex] = useState<undefined | number>(
        undefined
    );

    const [diagrams, setDiagrams] = useState(
        plugin.settings.supported_diagrams
    );
    const [diagramsPerPage, setDiagramsPerPage] = useState(
        plugin.settings.diagramsPerPage
    );

    useEffect(() => {
        const handler = async () => {
            setDiagramsPerPage(plugin.settings.diagramsPerPage);
        };

        plugin.observer.subscribe(
            app.workspace,
            EventID.ItemsPerPageChanged,
            handler
        );
        return (): void => {
            plugin.observer.unsubscribeFromEvent(
                app.workspace,
                EventID.ItemsPerPageChanged
            );
        };
    }, [app.workspace, plugin.settings]);

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(diagrams.length / diagramsPerPage);

    const startIndex = (currentPage - 1) * diagramsPerPage;
    const endIndex = startIndex + diagramsPerPage;

    const handleDelete = async (index: number) => {
        debugger;
        const newDiagrams = [...diagrams];
        newDiagrams.splice(index, 1);

        setDiagrams(newDiagrams);
        plugin.settings.supported_diagrams = newDiagrams;
        await plugin.settingsManager.saveSettings();

        if (currentPage > 1 && startIndex >= newDiagrams.length) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleSaveEditing = async (index: number) => {
        const editingNameInput: HTMLInputElement | null =
            document.querySelector('#editing-name-input');
        const editingSelectorInput: HTMLInputElement | null =
            document.querySelector('#editing-selector-input');
        if (!editingNameInput || !editingSelectorInput) {
            return;
        }
        const validated = preEndValidateDiagram(
            plugin,
            editingNameInput,
            editingSelectorInput,
            diagrams.slice(0, index).concat(diagrams.slice(index + 1))
        );

        if (validated) {
            diagrams[index].name = editingNameInput.value;
            diagrams[index].selector = editingSelectorInput.value;
            setDiagrams([...diagrams]);
            plugin.settings.supported_diagrams = diagrams;
            await plugin.settingsManager.saveSettings();
            editingNameInput.removeAttribute('id');
            editingSelectorInput.removeAttribute('id');
            setEditingIndex(undefined);
        }
        return validated;
    };

    const actualIndex = (index: number): number => startIndex + index;

    const navigateToPage = (delta: number) => {
        setCurrentPage((prev) =>
            Math.min(totalPages, Math.max(prev + delta, 1))
        );
    };

    const changePage = (delta: number): void => {
        if (editingIndex !== undefined) {
            new SwitchConfirm(
                app,
                diagrams[actualIndex(editingIndex)].name,
                async (result) => {
                    if (result === 'Yes') {
                        setEditingIndex(undefined);
                        navigateToPage(delta);
                    } else if (result === 'Save') {
                        const validated = await handleSaveEditing(
                            actualIndex(editingIndex)
                        );
                        if (!validated) {
                            plugin.showNotice('Could not save diagram');
                        }
                        navigateToPage(delta);
                    }
                }
            ).open();
        } else {
            navigateToPage(delta);
        }
    };

    return (
        <>
            <ButtonContainer>
                <PaginationButton
                    onClick={() => changePage(-1)}
                    disabled={currentPage === 1}
                >
                    ←
                </PaginationButton>
                {`Page ${currentPage} of ${totalPages} (Total diagrams: ${diagrams.length})`}
                <PaginationButton
                    onClick={() => changePage(1)}
                    disabled={currentPage === totalPages}
                >
                    →
                </PaginationButton>
            </ButtonContainer>
            {plugin.settings.supported_diagrams
                .slice(startIndex, endIndex)
                .map((diagram, index) => {
                    const { name, selector } = diagram;
                    return editingIndex === index ? (
                        <ReactObsidianSetting
                            addTexts={[
                                (nameInput): TextComponent => {
                                    nameInput.setValue(
                                        diagrams[actualIndex(index)].name
                                    );
                                    nameInput.inputEl.id = 'editing-name-input';
                                    nameInput.onChange((value) => {
                                        validateName(plugin, nameInput.inputEl);
                                    });
                                    return nameInput;
                                },
                                (selectorInput) => {
                                    selectorInput.setValue(
                                        diagrams[actualIndex(index)].selector
                                    );
                                    selectorInput.inputEl.id =
                                        'editing-selector-input';
                                    selectorInput.onChange((value) => {
                                        validateSelector(
                                            plugin,
                                            selectorInput.inputEl
                                        );
                                    });
                                    return selectorInput;
                                },
                            ]}
                            addButtons={[
                                (button): ButtonComponent => {
                                    button.setIcon('circle-x');
                                    button.setTooltip(
                                        'Cancel operation? All changes will be lost.'
                                    );
                                    button.onClick((cb) => {
                                        setEditingIndex(undefined);
                                    });
                                    return button;
                                },
                                (button): ButtonComponent => {
                                    button.setIcon('save');
                                    button.setTooltip(
                                        `Save changes for ${diagrams[actualIndex(index)].name}?`
                                    );
                                    button.onClick(async (cb) => {
                                        await handleSaveEditing(
                                            actualIndex(index)
                                        );
                                    });
                                    return button;
                                },
                            ]}
                        />
                    ) : (
                        <ReactObsidianSetting
                            name={name}
                            desc={selector}
                            addToggles={[
                                (toggle: ToggleComponent): ToggleComponent => {
                                    toggle.setValue(
                                        diagrams[actualIndex(index)].on
                                    );
                                    toggle.setTooltip(
                                        `${diagrams[actualIndex(index)].on ? 'Disable' : 'Enable'} ${diagrams[actualIndex(index)].name} diagram`
                                    );
                                    toggle.onChange(async (value) => {
                                        diagrams[actualIndex(index)].on = value;
                                        setDiagrams([...diagrams]);
                                        plugin.settings.supported_diagrams =
                                            diagrams;
                                        await plugin.settingsManager.saveSettings();
                                    });
                                    return toggle;
                                },
                            ]}
                            addButtons={[
                                diagrams[actualIndex(index)].name !==
                                    'Default' &&
                                    ((
                                        button: ButtonComponent
                                    ): ButtonComponent => {
                                        button.setIcon('edit');
                                        button.setTooltip(
                                            `Edit ${diagrams[actualIndex(index)].name} diagram`
                                        );
                                        button.onClick(async () => {
                                            setEditingIndex(index);
                                        });
                                        return button;
                                    }),
                                diagrams[actualIndex(index)].name !==
                                    'Default' &&
                                    ((
                                        button: ButtonComponent
                                    ): ButtonComponent => {
                                        button.setIcon('trash');
                                        button.setTooltip(
                                            `Delete ${diagrams[actualIndex(index)].name} diagram`
                                        );
                                        button.onClick(async () => {
                                            await handleDelete(
                                                actualIndex(index)
                                            );
                                        });
                                        return button;
                                    }),
                            ]}
                            addExtraButtons={[
                                (
                                    button: ExtraButtonComponent
                                ): ExtraButtonComponent => {
                                    button.setTooltip(
                                        `Set what controls will be active for ${diagrams[actualIndex(index)].name} diagram`
                                    );
                                    button.onClick(() => {
                                        const initial =
                                            diagrams[actualIndex(index)].panels;
                                        new DiagramSetConfrols(
                                            app,
                                            diagrams[actualIndex(index)].name,
                                            initial,
                                            async (result) => {
                                                const dPanels =
                                                    diagrams[actualIndex(index)]
                                                        .panels;
                                                dPanels[result.panel].on =
                                                    result.on;
                                                await plugin.settingsManager.saveSettings();
                                            }
                                        ).open();
                                    });
                                    return button;
                                },
                            ]}
                        />
                    );
                })}
        </>
    );
};

export default DiagramPagination;
