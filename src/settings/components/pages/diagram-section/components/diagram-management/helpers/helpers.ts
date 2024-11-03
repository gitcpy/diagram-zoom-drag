import DiagramZoomDragPlugin from '../../../../../../../core/diagram-zoom-drag-plugin';
import { DiagramData } from '../../../../../../typing/interfaces';

const diagramR = /^[\w-]+$/;
const selectorR = /^[.#][\w\s._>+~-]+$/;

/**
 * Checks if the diagram already exists.
 *
 * @param plugin - An instance of the `DiagramZoomDragPlugin` class.
 * @param nameInput - The input element for the diagram name.
 * @param selectorInput - The input element for the diagram selector.
 * @param diagramArray - An array of the existing diagrams.
 * @returns A boolean indicating whether the diagram already exists or not.
 *
 * If the diagram already exists, the function will add a shake effect to the input elements,
 * show a notification with the message 'Diagram already exists!' and return `false`.
 * If the diagram does not exist, the function will return `true`.
 */
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

/**
 * Checks if the input values are valid.
 *
 * @param plugin - An instance of the `DiagramZoomDragPlugin` class.
 * @param nameInput - The input element for the diagram name.
 * @param selectorInput - The input element for the diagram selector.
 * @returns A boolean indicating whether the input values are valid or not.
 *
 * If either of the input values is not valid, the function will add a shake effect to the input elements,
 * show a notification with the message 'Input is not valid!' and return `false`.
 * If the input values are valid, the function will return `true`.
 */
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

/**
 * Checks if the input values are valid and does not already exist in the array.
 *
 * @param plugin - An instance of the `DiagramZoomDragPlugin` class.
 * @param nameInput - The input element for the diagram name.
 * @param selectorInput - The input element for the diagram selector.
 * @param diagramArray - An array of existing diagrams.
 * @returns A boolean indicating whether the input values are valid and do not already exist.
 */
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

/**
 * Validates the diagram name input.
 *
 * If the input is empty, removes the 'invalid' class and clears the aria-label.
 * If the input is not empty, checks if it matches the allowed characters and toggles
 * the 'invalid' class and sets a corresponding aria-label.
 *
 * @param plugin - An instance of the `DiagramZoomDragPlugin` class.
 * @param nameInput - The input element for the diagram name.
 */
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
            ? 'Incorrect input. Should be only `A-Za-z0-9-`'
            : '';
    }
}

/**
 * Validates the CSS selector input.
 *
 * If the input is empty, removes the 'invalid' class and clears the aria-label.
 * If the input is not empty, checks if it matches the valid CSS selector pattern
 * and toggles the 'invalid' class and sets a corresponding aria-label.
 *
 * @param plugin - An instance of the `DiagramZoomDragPlugin` class.
 * @param selectorInput - The input element for the diagram selector.
 */
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
            ? 'Input incorrect. It seems to be not a valid CSS selector?'
            : '';
    }
}
