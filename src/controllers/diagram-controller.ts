import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';

export class DiagramController {
    constructor(public plugin: DiagramZoomDragPlugin) {}

    /**
     * Moves the diagram element in the given container by the given dx and dy
     * amounts. If setAnimation is true, the element will be animated to its
     * new position. Otherwise, the element will be positioned immediately.
     * @param container - The container element that contains the diagram
     * element.
     * @param dx - The horizontal distance to move the element.
     * @param dy - The vertical distance to move the element.
     * @param setAnimation - Whether to animate the movement of the element. Defaults to undefined.
     */
    moveElement(
        container: HTMLElement,
        dx: number,
        dy: number,
        setAnimation?: boolean
    ): void {
        this.plugin.activeContainer = container;

        const element = container.querySelector(
            this.plugin.compoundSelector
        ) as HTMLElement | null;
        if (element) {
            this.plugin.dx += dx;
            this.plugin.dy += dy;
            element.setCssStyles({
                transition: setAnimation ? 'transform 0.3s ease-out' : 'none',
                transform: `translate(${this.plugin.dx}px, ${this.plugin.dy}px) scale(${this.plugin.scale})`,
            });
            if (setAnimation) {
                this.plugin.view.registerDomEvent(
                    element,
                    'transitionend',
                    () => {
                        element.setCssStyles({
                            transition: 'none',
                        });
                    },
                    { once: true }
                );
            }
        }
    }

    /**
     * Zooms the diagram element in the given container by the given factor.
     * If setAnimation is true, the element will be animated to its new scale.
     * Otherwise, the element will be scaled immediately.
     * @param container - The container element that contains the diagram
     * element.
     * @param factor - The zoom factor. For example, 1.5 means 150% scale.
     * @param setAnimation - Whether to animate the zooming of the element. Defaults to undefined.
     */
    zoomElement(
        container: HTMLElement,
        factor: number,
        setAnimation?: boolean
    ): void {
        this.plugin.activeContainer = container;
        const element = container.querySelector(
            this.plugin.compoundSelector
        ) as HTMLElement | null;
        if (element) {
            const containerRect = container.getBoundingClientRect();

            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            const offsetX = (centerX - this.plugin.dx) / this.plugin.scale;
            const offsetY = (centerY - this.plugin.dy) / this.plugin.scale;

            this.plugin.scale *= factor;
            this.plugin.scale = Math.max(0.125, this.plugin.scale);

            this.plugin.dx = centerX - offsetX * this.plugin.scale;
            this.plugin.dy = centerY - offsetY * this.plugin.scale;

            element.setCssStyles({
                transition: setAnimation
                    ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                    : 'none',
                transform: `translate(${this.plugin.dx}px, ${this.plugin.dy}px) scale(${this.plugin.scale})`,
            });
            if (setAnimation) {
                this.plugin.view.registerDomEvent(
                    element,
                    'transitionend',
                    () => {
                        element.setCssStyles({
                            transition: 'none',
                        });
                    },
                    { once: true }
                );
            }
        }
    }

    /**
     * Resets the zoom and move state of the diagram element in the given container to its
     * original state. If setAnimation is true, the element will be animated to its original state.
     * Otherwise, the element will be reset immediately.
     * @param container - The container element that contains the diagram element.
     * @param setAnimation - Whether to animate the reset of the element. Defaults to undefined.
     */
    resetZoomAndMove(container: HTMLElement, setAnimation?: boolean): void {
        const element = container.querySelector(
            this.plugin.compoundSelector
        ) as HTMLElement | null;
        if (element) {
            this.fitToContainer(element, container, setAnimation);
        }
    }

    /**
     * Fits the diagram element to its container element. The element will be scaled to fit within its container while maintaining its aspect ratio.
     * If setAnimation is true, the element will be animated to its new position and scale. Otherwise, the element will be positioned and scaled immediately.
     * @param element - The diagram element to be fitted.
     * @param container - The container element that contains the diagram element.
     * @param setAnimation - Whether to animate the fitting of the element. Defaults to undefined.
     */
    fitToContainer(
        element: HTMLElement,
        container: HTMLElement,
        setAnimation?: boolean
    ): void {
        this.plugin.activeContainer = container;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const diagramWidth = element.clientWidth;
        const diagramHeight = element.clientHeight;

        this.plugin.scale = Math.min(
            containerWidth / diagramWidth,
            containerHeight / diagramHeight,
            1
        );
        this.plugin.dx =
            (containerWidth - diagramWidth * this.plugin.scale) / 2;
        this.plugin.dy =
            (containerHeight - diagramHeight * this.plugin.scale) / 2;

        element.setCssStyles({
            transition: setAnimation
                ? 'transform 0.3s cubic-bezier(0.42, 0, 0.58, 1)'
                : 'none',
            transform: `translate(${this.plugin.dx}px, ${this.plugin.dy}px) scale(${this.plugin.scale})`,
            transformOrigin: 'top left',
        });
        if (setAnimation) {
            this.plugin.view.registerDomEvent(
                element,
                'transitionend',
                () => {
                    element.setCssStyles({
                        transition: 'none',
                    });
                },
                { once: true }
            );
        }
    }
}
