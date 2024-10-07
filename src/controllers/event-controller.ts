import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { publishPanelsStateEvent } from '../helpers/helpers';

export default class EventController {
    constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Adds mouse events to the given container element.
     *
     * This method adds event listeners to the container element for the following
     * events:
     * - `wheel`: Zooms the diagram when the user scrolls while holding the Ctrl
     *   key.
     * - `mousedown`: Starts dragging the diagram when the user clicks and holds
     *   the left mouse button.
     * - `mousemove`: Moves the diagram when the user drags the diagram while
     *   holding the left mouse button.
     * - `mouseup`: Stops dragging the diagram when the user releases the left
     *   mouse button.
     * - `mouseleave`: Stops dragging the diagram when the user leaves the
     *   container element while holding the left mouse button.
     *
     * @param container - The container element to add the events to.
     */
    addMouseEvents(container: HTMLElement): void {
        let startX: number, startY: number, initialX: number, initialY: number;
        let isDragging = false;

        const diagramElement: HTMLElement | null = container.querySelector(
            this.plugin.compoundSelector
        );

        if (!diagramElement) {
            return;
        }

        if (diagramElement.classList.contains('events-bound')) {
            return;
        }

        diagramElement.classList.add('events-bound');

        this.plugin.view.registerDomEvent(
            container,
            'wheel',
            (event: WheelEvent) => {
                if (!event.ctrlKey) {
                    return;
                }
                this.plugin.activeContainer = container;
                event.preventDefault();
                const rect = diagramElement.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const offsetY = event.clientY - rect.top;

                const prevScale = this.plugin.scale;
                this.plugin.scale += event.deltaY * -0.001;
                this.plugin.scale = Math.max(0.125, this.plugin.scale);

                const dx = offsetX * (1 - this.plugin.scale / prevScale);
                const dy = offsetY * (1 - this.plugin.scale / prevScale);

                this.plugin.dx += dx;
                this.plugin.dy += dy;

                diagramElement.setCssStyles({
                    transform: `translate(${this.plugin.dx}px, ${this.plugin.dy}px) scale(${this.plugin.scale})`,
                });
            }
        );
        this.plugin.view.registerDomEvent(
            container,
            'mousedown',
            (event: MouseEvent) => {
                if (event.button !== 0) {
                    return;
                }
                this.plugin.activeContainer = container;
                container.focus({ preventScroll: true });
                isDragging = true;
                startX = event.clientX;
                startY = event.clientY;

                initialX = this.plugin.dx;
                initialY = this.plugin.dy;
                diagramElement.setCssStyles({
                    cursor: 'grabbing',
                });
                event.preventDefault();
            }
        );
        this.plugin.view.registerDomEvent(
            container,
            'mousemove',
            (event: MouseEvent) => {
                if (!isDragging) {
                    return;
                }
                this.plugin.activeContainer = container;

                const dx = event.clientX - startX;
                const dy = event.clientY - startY;
                this.plugin.dx = initialX + dx;
                this.plugin.dy = initialY + dy;
                diagramElement.setCssStyles({
                    transform: `translate(${this.plugin.dx}px, ${this.plugin.dy}px) scale(${this.plugin.scale})`,
                });
            }
        );
        this.plugin.view.registerDomEvent(container, 'mouseup', () => {
            this.plugin.activeContainer = container;
            if (isDragging) {
                isDragging = false;
                diagramElement.setCssStyles({ cursor: 'grab' });
            }
        });
        this.plugin.view.registerDomEvent(container, 'mouseleave', () => {
            this.plugin.activeContainer = container;
            if (isDragging) {
                isDragging = false;
                diagramElement.setCssStyles({ cursor: 'grab' });
            }
        });
    }

    /**
     * Adds touch event listeners to the given container element.
     *
     * This function adds the following event listeners to the given container element:
     * - `touchstart`: Handles the start of a touch event for the diagram element.
     * - `touchmove`: Handles the move event for the diagram element. If the element is being pinched, zoom the element. If the element is being dragged, move it.
     * - `touchend`: Handles the end of a touch event for the diagram element.
     * - `scroll`: Handles the scroll event for the diagram element.
     *
     * @param container - The container element to add the touch event listeners to.
     */
    addTouchEvents(container: HTMLElement): void {
        let startX: number;
        let startY: number;
        let initialDistance: number;
        let isDragging: boolean = false;
        let isPinching: boolean = false;
        const BUTTON_SELECTOR =
            '.diagram-zoom-panel button, .diagram-move-panel button, .diagram-service-panel button';

        /**
         * Calculates the distance between two touch points.
         * @param touches - The two touch points.
         * @returns The distance between the two touch points.
         */
        const calculateDistance = (touches: TouchList): number => {
            const [touch1, touch2] = [touches[0], touches[1]];
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        /**
         * Handles the start of a touch event for the diagram element.
         * @param plugin - The plugin instance.
         * @returns A function that handles the touchstart event.
         */
        function touchStart(plugin: DiagramZoomDragPlugin) {
            return function innerTS(e: TouchEvent) {
                if (plugin.nativeTouchEventsEnabled) {
                    return;
                }
                plugin.activeContainer = container;

                const target = e.target as HTMLElement;
                // we got touch to a button panel - returning
                if (target.closest(BUTTON_SELECTOR)) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();

                if (e.touches.length === 1) {
                    isDragging = true;
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                } else if (e.touches.length === 2) {
                    isPinching = true;
                    initialDistance = calculateDistance(e.touches);
                }
            };
        }

        /**
         * Handles the move event for the diagram element. If the element is being pinched, zoom the element. If the element is being dragged, move it.
         * @param plugin - The plugin instance.
         * @returns A function that handles the touchmove event.
         */
        function touchMove(plugin: DiagramZoomDragPlugin) {
            return function innerTM(e: TouchEvent) {
                if (plugin.nativeTouchEventsEnabled) {
                    return;
                }
                plugin.activeContainer = container;

                e.preventDefault();
                e.stopPropagation();

                const element: HTMLElement | null = container.querySelector(
                    plugin.compoundSelector
                );
                if (!element) {
                    return;
                }

                if (isDragging && e.touches.length === 1) {
                    const dx = e.touches[0].clientX - startX;
                    const dy = e.touches[0].clientY - startY;

                    plugin.diagramController.moveElement(container, dx, dy);

                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                } else if (isPinching && e.touches.length === 2) {
                    const currentDistance = calculateDistance(e.touches);
                    const factor = currentDistance / initialDistance;

                    plugin.diagramController.zoomElement(container, factor);

                    initialDistance = currentDistance;
                }
            };
        }

        /**
         * Handles the end of a touch event for the diagram element.
         * @param plugin - The plugin instance.
         * @returns A function that handles the touchend event.
         */
        function touchEnd(plugin: DiagramZoomDragPlugin) {
            return function innerTE(e: TouchEvent) {
                if (plugin.nativeTouchEventsEnabled) {
                    return;
                }
                plugin.activeContainer = container;

                const target = e.target as HTMLElement;
                // we got touch to a button panel - returning
                if (target.closest(BUTTON_SELECTOR)) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                isDragging = false;
                isPinching = false;
            };
        }

        /**
         * Handles the scroll event for the diagram element.
         * @param plugin - The plugin instance.
         * @returns A function that handles the scroll event.
         */
        function scroll(plugin: DiagramZoomDragPlugin) {
            return function innerScroll(e: Event) {
                if (plugin.nativeTouchEventsEnabled) {
                    return;
                }
                plugin.activeContainer = container;

                e.preventDefault();
                e.stopPropagation();
            };
        }

        const touchStartHandler = touchStart(this.plugin);
        const touchMoveHandler = touchMove(this.plugin);
        const touchEndHandler = touchEnd(this.plugin);
        const scrollHandler = scroll(this.plugin);

        this.plugin.view.registerDomEvent(
            container,
            'touchstart',
            touchStartHandler,
            {
                passive: false,
            }
        );
        this.plugin.view.registerDomEvent(
            container,
            'touchmove',
            touchMoveHandler,
            {
                passive: false,
            }
        );
        this.plugin.view.registerDomEvent(
            container,
            'touchend',
            touchEndHandler,
            {
                passive: false,
            }
        );
        this.plugin.view.registerDomEvent(container, 'scroll', scrollHandler, {
            passive: false,
        });
    }
    /**
     * Adds keyboard event handling for a given container element.
     *
     * This function returns an event handler for `keydown` events that enables
     * keyboard-based navigation and zoom controls for diagram elements.
     *
     * The following keys are supported:
     * - Arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) to move the element.
     * - `=` or `+` (with `Ctrl`/`Cmd`) to zoom in.
     * - `-` (with `Ctrl`/`Cmd`) to zoom out.
     * - `0` (with `Ctrl`/`Cmd`) to reset zoom and position.
     *
     * When one of the supported keys is pressed, the corresponding action is
     * applied to the `container` element, and the event's default behavior is prevented.
     *
     * @param {HTMLElement} container - The container element to which keyboard events will be bound.
     * @returns {(e: KeyboardEvent) => void} A function to handle keyboard events.
     */
    addKeyboardEvents(container: HTMLElement): (e: KeyboardEvent) => void {
        return (e: KeyboardEvent): void => {
            const key = e.code;
            const KEYS = [
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
                'Equal',
                'Minus',
                'Digit0',
                'KeyM',
            ];
            if (!KEYS.includes(key)) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            this.plugin.activeContainer = container;

            switch (key) {
                case 'ArrowUp':
                    this.plugin.diagramController.moveElement(
                        container,
                        0,
                        50,
                        true
                    );
                    break;
                case 'ArrowDown':
                    this.plugin.diagramController.moveElement(
                        container,
                        0,
                        -50,
                        true
                    );
                    break;
                case 'ArrowLeft':
                    this.plugin.diagramController.moveElement(
                        container,
                        50,
                        0,
                        true
                    );
                    break;
                case 'ArrowRight':
                    this.plugin.diagramController.moveElement(
                        container,
                        -50,
                        0,
                        true
                    );
                    break;
            }

            if (e.ctrlKey) {
                switch (key) {
                    case 'Equal':
                        this.plugin.diagramController.zoomElement(
                            container,
                            1.1,
                            true
                        );
                        break;
                    case 'Minus':
                        this.plugin.diagramController.zoomElement(
                            container,
                            0.9,
                            true
                        );
                        break;
                    case 'Digit0':
                        this.plugin.diagramController.resetZoomAndMove(
                            container,
                            true
                        );
                        break;
                    case 'KeyM': {
                        if (!this.plugin.settings.hideByCtrlPlusM) {
                            return;
                        }
                        const panels: NodeListOf<HTMLElement> =
                            container.querySelectorAll(
                                '.diagram-container:not(.folded) .mermaid-zoom-drag-panel:not(.diagram-fold-panel)'
                            );

                        const state = panels[0].hasClass('hidden');

                        panels.forEach((panel) => {
                            if (state) {
                                panel.removeClass('hidden');
                                panel.addClass('visible');
                                publishPanelsStateEvent(this.plugin, true);
                            } else {
                                panel.removeClass('visible');
                                panel.addClass('hidden');
                                publishPanelsStateEvent(this.plugin, false);
                            }
                        });
                        break;
                    }
                }
            }
        };
    }

    addFocusEvents(container: HTMLElement): void {
        this.plugin.view.registerDomEvent(container, 'focusin', () => {
            if (this.plugin.settings.automaticFolding) {
                container.removeClass('folded');
            }
        });

        this.plugin.view.registerDomEvent(container, 'focusout', () => {
            if (this.plugin.settings.automaticFolding) {
                container.addClass('folded');
            }
        });
    }

    togglePanelVisibilityOnHover(panel: HTMLElement): void {
        this.plugin.view?.registerDomEvent(panel, 'mouseover', () => {
            if (!this.plugin.settings.hideOnMouseOutPanels) {
                return;
            }

            if (panel.parentElement?.hasClass('folded')) {
                return;
            }

            panel.removeClass('hidden');
            panel.addClass('visible');
        });

        this.plugin.view.registerDomEvent(panel, 'mouseout', () => {
            if (!this.plugin.settings.hideOnMouseOutPanels) {
                return;
            }
            if (panel.parentElement?.hasClass('folded')) {
                return;
            }

            panel.removeClass('visible');
            panel.addClass('hidden');
        });
    }

    togglePanelVisibilityOnDiagramHover(container: HTMLElement): void {
        const panels: NodeListOf<HTMLElement> = container.querySelectorAll(
            '.mermaid-zoom-drag-panel:not(.diagram-fold-panel)'
        );

        this.plugin.view.registerDomEvent(container, 'mouseenter', () => {
            if (!this.plugin.settings.hideOnMouseOutDiagram) {
                return;
            }
            if (container.hasClass('folded')) {
                return;
            }
            panels.forEach((panel) => {
                panel.addClass('visible');
                panel.removeClass('hidden');
            });
        });
        this.plugin.view.registerDomEvent(container, 'mouseleave', () => {
            if (!this.plugin.settings.hideOnMouseOutDiagram) {
                return;
            }
            if (container.hasClass('folded')) {
                return;
            }

            panels.forEach((panel) => {
                panel.removeClass('visible');
                panel.addClass('hidden');
            });
        });
    }
}
