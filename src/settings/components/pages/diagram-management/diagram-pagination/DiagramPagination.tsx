import React, { useEffect, useState } from 'react';
import { useSettingsContext } from '../../../core/context';
import { ButtonContainer, PaginationButton } from './styled/styled';
import { h } from 'preact';
import { ButtonComponent, ToggleComponent } from 'obsidian';
import { ReactObsidianSetting } from '../../../react-obsidian-setting/ObsidianSettingReact';
import { EventID } from '../../../../../events-management/typing/constants';
import {
    preEndValidateDiagram,
    validateName,
    validateSelector,
} from '../../../helpers/helpers';
import { SwitchConfirmModal } from '../modals/switch-confirm-modal';

// TODO вынести вещи в отдельные хуки. например - сохранение настроек

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
            plugin.observer.unsubscribe(
                app.workspace,
                EventID.ItemsPerPageChanged,
                handler
            );
        };
    }, [app.workspace, plugin.settings]);

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(diagrams.length / diagramsPerPage);

    const startIndex = (currentPage - 1) * diagramsPerPage;
    const endIndex = startIndex + diagramsPerPage;

    const handleDelete = async (index: number) => {
        const newDiagrams = [...diagrams];
        newDiagrams.splice(startIndex + index, 1);

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

    const actualIndex = (index: number) => startIndex + index;

    const navigateToPage = (delta: number) => {
        setCurrentPage((prev) =>
            Math.min(totalPages, Math.max(prev + delta, 1))
        );
    };

    const changePage = (delta: number): void => {
        if (editingIndex !== undefined) {
            new SwitchConfirmModal(app, async (result) => {
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
            }).open();
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
                                (nameInput) => {
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
                                (button) => {
                                    button.setIcon('circle-x');
                                    button.onClick((cb) => {
                                        setEditingIndex(undefined);
                                    });
                                    return button;
                                },
                                (button) => {
                                    button.setIcon('save');
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
                                        `${diagrams[actualIndex(index)].on ? 'Disable' : 'Enable'} this diagram`
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
                                    ((button: ButtonComponent) => {
                                        button.setIcon('edit');
                                        button.setTooltip('Edit this diagram');
                                        button.onClick(async () => {
                                            setEditingIndex(index);
                                        });
                                        return button;
                                    }),
                                diagrams[actualIndex(index)].name !==
                                    'Default' &&
                                    ((button: ButtonComponent) => {
                                        button.setIcon('trash');
                                        button.setTooltip(
                                            'Delete this diagram'
                                        );
                                        button.onClick(async () => {
                                            await handleDelete(
                                                actualIndex(index)
                                            );
                                        });
                                        return button;
                                    }),
                            ]}
                        />
                    );
                })}
        </>
    );
};

export default DiagramPagination;
