import DiagramZoomDragPlugin from '../../../core/diagram-zoom-drag-plugin';
import { DiagramData } from '../../typing/interfaces';

const diagramR = new RegExp(/^[A-Za-z0-9]+$/);
const selectorR = new RegExp(/^\.[A-Za-z][\w-]*$/);

function preEndCheckExistingDiagram(
    plugin: DiagramZoomDragPlugin,
    nameInput: HTMLInputElement,
    selectorInput: HTMLInputElement,
    diagramArray: DiagramData[]
): boolean {
    const name = nameInput.value;
    const selector = selectorInput.value;

    const isAlreadyExist = diagramArray.find(
        (d) => d.name === name || d.selector === selector
    );

    if (isAlreadyExist) {
        nameInput.addClass('shake');
        selectorInput.addClass('shake');

        setTimeout(() => {
            nameInput.removeClass('shake');
            selectorInput.removeClass('shake');
        }, 500);
        plugin.showNotice('Diagram already exists!');
        return false;
    }
    return true;
}

function preEndCheckInputs(
    plugin: DiagramZoomDragPlugin,
    nameInput: HTMLInputElement,
    selectorInput: HTMLInputElement
): boolean {
    const name = nameInput.value;
    const selector = selectorInput.value;
    if (!diagramR.test(name) || !selectorR.test(selector)) {
        plugin.showNotice('Input is not valid!');
        nameInput.addClass('snake');
        selectorInput.addClass('snake');

        setTimeout(() => {
            nameInput.removeClass('shake');
            selectorInput.removeClass('shake');
        }, 500);
        return false;
    }
    return true;
}

export function preEndValidateDiagram(
    plugin: DiagramZoomDragPlugin,
    nameInput: HTMLInputElement,
    selectorInput: HTMLInputElement,
    diagramArray: DiagramData[]
): boolean {
    const valid = preEndCheckInputs(plugin, nameInput, selectorInput);
    const notExists = preEndCheckExistingDiagram(
        plugin,
        nameInput,
        selectorInput,
        diagramArray
    );

    return valid && notExists;
}

export function validateName(
    plugin: DiagramZoomDragPlugin,
    nameInput: HTMLInputElement
): void {
    const text = nameInput.value;
    const dTest = diagramR.test(text);
    if (!text) {
        nameInput.removeClass('invalid');
        nameInput.ariaLabel = '';
    } else {
        nameInput.toggleClass('invalid', !dTest);
        nameInput.ariaLabel = !dTest
            ? 'Incorrect input. Should be only `A-Za-z0-9`'
            : '';
    }
}

export function validateSelector(
    plugin: DiagramZoomDragPlugin,
    selectorInput: HTMLInputElement
): void {
    const text = selectorInput.value;
    const sTest = selectorR.test(text);
    if (!text) {
        selectorInput.removeClass('invalid');
        selectorInput.ariaLabel = '';
    } else {
        selectorInput.toggleClass('invalid', !sTest);
        selectorInput.ariaLabel = !sTest
            ? 'Input incorrect. Should be a dot in the beginning, then next character only `A-Za-z` ant then only `A-Za-z0-9-` after it'
            : '';
    }
}
