import {
    MarkdownPostProcessorContext,
    MarkdownView,
    Notice,
    Platform,
    Plugin,
    setIcon,
} from 'obsidian';
import { MermaidSelectors } from './constants';
import { ContainerID, LeafID } from './typing';
import { ViewData } from './view-data';
import { v4 as uuidv4 } from 'uuid';

export default class MermaidZoomDragPlugin extends Plugin {
    dx!: number;
    dy!: number;
    scale!: number;
    nativeTouchEventsEnabled!: boolean;
    private view!: MarkdownView;
    leafID!: LeafID | undefined;
    private viewData!: ViewData;
    activeContainer!: HTMLElement;

    async onload(): Promise<void> {
        this.viewData = new ViewData(this);

        this.registerMarkdownPostProcessor(
            (element: HTMLElement, context: MarkdownPostProcessorContext) => {
                this.cleanupView();
                this.initializeView();
            }
        );

        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.cleanupView();
                this.initializeView();
            })
        );

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => {
                this.cleanupView();
                this.initializeView();
            })
        );
    }

    getCompoundSelector(): string {
        return Object.values(MermaidSelectors).join(', ');
    }

    initializeMermaidFeatures(ele: HTMLElement): void {
        const observer = new MutationObserver(() => {
            this.initializeMermaidElements(ele);
        });

        observer.observe(ele, { childList: true, subtree: true });
        this.initializeMermaidElements(ele);
    }

    initializeMermaidElements(ele: HTMLElement): void {
        this.addMermaidContainers(ele);
    }

    addMermaidContainers(ele: HTMLElement): void {
        const mermaidElements = ele.querySelectorAll(
            this.getCompoundSelector()
        );

        mermaidElements.forEach((el) => {
            if (!el.classList.contains('centered')) {
                el.classList.add('centered');
            }

            if (!el.parentElement?.classList.contains('mermaid-container')) {
                const container = ele.doc.createElement('div');
                container.className = 'mermaid-container';
                container.setCssStyles({
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    height: '70vh',
                });

                el.parentNode?.insertBefore(container, el);
                container.appendChild(el);
                container.id = uuidv4();
                const el_html = el as HTMLElement;
                el_html.setCssStyles({
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    transformOrigin: 'top left',
                    cursor: 'grab',
                    width: '100%',
                    height: '100%',
                });

                this.initializeViewData(container.id);
                this.addControlPanel(container);
                this.addMouseEvents(container);
                container.setAttribute('tabindex', '0');
                this.view.registerDomEvent(
                    container,
                    'keydown',
                    this.keyboardHandler(container),
                    { passive: false }
                );
                setTimeout(() => {
                    this.fitToContainer(el_html, container);
                }, 0);
            }
        });
    }

    /**
     * Adds a control panel to the provided container element.
     * The control panel includes buttons for moving and zooming the element.
     *
     * @param {HTMLElement} container - The container element to which the control panel will be added.
     */
    addControlPanel(container: HTMLElement): void {
        this.activeContainer = container;

        const panelStyles = {
            position: 'absolute',
            display: 'grid',
            gap: '5px',
            background: 'rgba(var(--background-primary-rgb), 0.7)',
            padding: '5px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        };

        const createPanel = (
            className: string,
            styles: object
        ): HTMLElement => {
            const panel = container.doc.createElement('div');
            panel.className = className;
            panel.setCssStyles(styles);
            return panel;
        };

        const createButton = (
            icon: string,
            action: () => void,
            title: string,
            active = true,
            id: string | undefined = undefined
        ): HTMLElement => {
            const button = container.doc.createElement('button');
            button.className = 'button';
            button.id = id ?? '';

            if (active) {
                button.setCssStyles({
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '3px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease',
                    pointerEvents: 'auto',
                });
                setIcon(button, icon);

                this.view.registerDomEvent(button, 'click', action);

                this.view.registerDomEvent(button, 'mouseenter', () => {
                    button.setCssStyles({
                        color: 'var(--interactive-accent)',
                    });
                });

                this.view.registerDomEvent(button, 'mouseleave', () => {
                    button.setCssStyles({
                        color: 'var(--text-muted)',
                    });
                });
            } else {
                button.setCssStyles({
                    visibility: 'hidden',
                });
            }

            button.setAttribute('aria-label', title);
            return button;
        };

        const movePanel = createPanel('mermaid-move-panel', {
            ...panelStyles,
            right: '10px',
            bottom: '10px',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
        });

        const moveButtons = [
            {
                icon: 'arrow-up-left',
                action: (): void => this.moveElement(container, 50, 50, true),
                title: 'Move up left',
            },
            {
                icon: 'arrow-up',
                action: (): void => this.moveElement(container, 0, 50, true),
                title: 'Move up',
            },
            {
                icon: 'arrow-up-right',
                action: (): void => this.moveElement(container, -50, 50, true),
                title: 'Move up right',
            },
            {
                icon: 'arrow-left',
                action: (): void => this.moveElement(container, 50, 0, true),
                title: 'Move left',
            },
            {
                icon: '',
                action: (): void => {},
                title: '',
                active: false,
                id: '',
            },
            {
                icon: 'arrow-right',
                action: (): void => this.moveElement(container, -50, 0, true),
                title: 'Move right',
            },
            {
                icon: 'arrow-down-left',
                action: (): void => this.moveElement(container, 50, -50, true),
                title: 'Move down left',
            },
            {
                icon: 'arrow-down',
                action: (): void => this.moveElement(container, 0, -50, true),
                title: 'Move down',
            },
            {
                icon: 'arrow-down-right',
                action: (): void => this.moveElement(container, -50, -50, true),
                title: 'Move down right',
            },
        ];

        moveButtons.forEach((btn) =>
            movePanel.appendChild(
                createButton(
                    btn.icon,
                    btn.action,
                    btn.title,
                    btn.active,
                    btn.id
                )
            )
        );

        const zoomPanel = createPanel('mermaid-zoom-panel', {
            ...panelStyles,
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            gridTemplateColumns: '1fr',
        });

        const zoomButtons = [
            {
                icon: 'zoom-in',
                action: (): void => this.zoomElement(container, 1.1, true),
                title: 'Zoom In',
            },
            {
                icon: 'refresh-cw',
                action: (): void => this.resetZoomAndMove(container, true),
                title: 'Reset Zoom and Position',
            },
            {
                icon: 'zoom-out',
                action: (): void => this.zoomElement(container, 0.9, true),
                title: 'Zoom Out',
            },
        ];

        zoomButtons.forEach((btn) =>
            zoomPanel.appendChild(
                createButton(btn.icon, btn.action, btn.title, true)
            )
        );

        const servicePanel = createPanel('mermaid-service-panel', {
            ...panelStyles,
            right: '10px',
            top: '10px',
            gridTemplateColumns: 'repeat(2, 1fr)',
        });

        let hiding = false;
        const isMobile = Platform.isMobile;

        const getNativeBtnIcon = (): string =>
            this.nativeTouchEventsEnabled ? 'circle-slash-2' : 'hand';
        const hideBtnIcon = (): string => (hiding ? 'eye-off' : 'eye');
        const hideShowAction = (): void => {
            hiding = !hiding;
            [movePanel, zoomPanel].forEach((panel) => {
                panel.setCssStyles({
                    visibility: hiding ? 'hidden' : 'visible',
                    pointerEvents: hiding ? 'none' : 'auto',
                });
            });
            const button = container.doc.getElementById(
                'hide-show-button-mermaid'
            );
            if (!button) {
                return;
            }
            setIcon(button, hideBtnIcon());
            button.setAttribute(
                'aria-label',
                `${hiding ? 'Show' : 'Hide'} move and zoom panels`
            );
        };
        const toggleNativeEventsAction = (): void => {
            this.nativeTouchEventsEnabled = !this.nativeTouchEventsEnabled;
            const btn = container.doc.getElementById('native-touch-events');
            if (!btn) {
                return;
            }
            setIcon(btn, getNativeBtnIcon());
            const fl = this.nativeTouchEventsEnabled;
            btn.ariaLabel = `${fl ? 'Enable' : 'Disable'} move and pinch zoom`;
            new Notice(
                `Native touches are ${fl ? 'enabled' : 'disabled'} now. You ${fl ? 'cannot' : 'can'} move and pinch zoom mermaid diagram.`
            );
        };

        const fullScreenKeyboardHandler = this.keyboardHandler(container);
        container.onfullscreenchange = (): void => {
            const fullscreenEl = document.querySelector(
                '.obsidian-app'
            ) as HTMLElement; // in fullscreen mode fullscreen element is .obisidian-app el
            if (container === document.fullscreenElement) {
                this.view.registerDomEvent(
                    fullscreenEl,
                    'keydown',
                    fullScreenKeyboardHandler
                );
            } else {
                fullscreenEl.removeEventListener(
                    'keydown',
                    fullScreenKeyboardHandler
                );
                this.view.contentEl.focus();
            }
        };

        const serviceButtons = [
            {
                icon: hideBtnIcon(),
                action: hideShowAction,
                title: `Hide move and zoom panels`,
                id: 'hide-show-button-mermaid',
            },
            {
                icon: 'maximize',
                action: async (): Promise<void> => {
                    const button = container.querySelector(
                        '#open-fullscreen-button'
                    ) as HTMLElement | null;
                    if (!button) {
                        return;
                    }
                    if (!container.doc.fullscreenElement) {
                        await container.requestFullscreen({
                            navigationUI: 'auto',
                        });
                        setIcon(button, 'minimize');
                    } else {
                        await container.doc.exitFullscreen();
                        setIcon(button, 'maximize');
                    }
                },
                title: 'Open in fullscreen mode',
                id: 'open-fullscreen-button',
            },
        ];

        if (isMobile) {
            serviceButtons.push({
                icon: getNativeBtnIcon(),
                action: toggleNativeEventsAction,
                title: `${this.nativeTouchEventsEnabled ? 'Enable' : 'Disable'} move and pinch zoom`,
                id: 'native-touch-events',
            });
            this.manageTouchEvents(container);
        }

        serviceButtons.forEach((btn) =>
            servicePanel.appendChild(
                createButton(btn.icon, btn.action, btn.title, true, btn.id)
            )
        );

        container.appendChild(movePanel);
        container.appendChild(zoomPanel);
        container.appendChild(servicePanel);
    }

    moveElement(
        container: HTMLElement,
        dx: number,
        dy: number,
        setAnimation?: boolean
    ): void {
        this.activeContainer = container;

        const element = container.querySelector(
            this.getCompoundSelector()
        ) as HTMLElement | null;
        if (element) {
            this.dx += dx;
            this.dy += dy;
            element.setCssStyles({
                transition: setAnimation ? 'transform 0.3s ease-out' : 'none',
                transform: `translate(${this.dx}px, ${this.dy}px) scale(${this.scale})`,
            });
            if (setAnimation) {
                this.view.registerDomEvent(
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

    zoomElement(
        container: HTMLElement,
        factor: number,
        setAnimation?: boolean
    ): void {
        this.activeContainer = container;
        const element = container.querySelector(
            this.getCompoundSelector()
        ) as HTMLElement | null;
        if (element) {
            const containerRect = container.getBoundingClientRect();

            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            const offsetX = (centerX - this.dx) / this.scale;
            const offsetY = (centerY - this.dy) / this.scale;

            this.scale *= factor;
            this.scale = Math.max(0.125, this.scale);

            this.dx = centerX - offsetX * this.scale;
            this.dy = centerY - offsetY * this.scale;

            element.setCssStyles({
                transition: setAnimation
                    ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                    : 'none',
                transform: `translate(${this.dx}px, ${this.dy}px) scale(${this.scale})`,
            });
            if (setAnimation) {
                this.view.registerDomEvent(
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

    resetZoomAndMove(container: HTMLElement, setAnimation?: boolean): void {
        const element = container.querySelector(
            this.getCompoundSelector()
        ) as HTMLElement | null;
        if (element) {
            this.fitToContainer(element, container, setAnimation);
        }
    }

    fitToContainer(
        element: HTMLElement,
        container: HTMLElement,
        setAnimation?: boolean
    ): void {
        this.activeContainer = container;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const mermaidWidth = element.clientWidth;
        const mermaidHeight = element.clientHeight;

        this.scale = Math.min(
            containerWidth / mermaidWidth,
            containerHeight / mermaidHeight,
            1
        );
        this.dx = (containerWidth - mermaidWidth * this.scale) / 2;
        this.dy = (containerHeight - mermaidHeight * this.scale) / 2;

        element.setCssStyles({
            transition: setAnimation
                ? 'transform 0.3s cubic-bezier(0.42, 0, 0.58, 1)'
                : 'none',
            transform: `translate(${this.dx}px, ${this.dy}px) scale(${this.scale})`,
            transformOrigin: 'top left',
        });
        if (setAnimation) {
            this.view.registerDomEvent(
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

    addMouseEvents(container: HTMLElement): void {
        let startX: number, startY: number, initialX: number, initialY: number;
        let isDragging = false;

        const mermaidElement = container.querySelector(
            this.getCompoundSelector()
        ) as HTMLElement;

        if (mermaidElement.classList.contains('events-bound')) {
            return;
        }

        mermaidElement.classList.add('events-bound');

        this.view.registerDomEvent(
            container as HTMLElement,
            'wheel',
            (event: WheelEvent) => {
                if (!event.ctrlKey) {
                    return;
                }
                this.activeContainer = container;
                event.preventDefault();
                const rect = mermaidElement.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const offsetY = event.clientY - rect.top;

                const prevScale = this.scale;
                this.scale += event.deltaY * -0.001;
                this.scale = Math.max(0.125, this.scale);

                const dx = offsetX * (1 - this.scale / prevScale);
                const dy = offsetY * (1 - this.scale / prevScale);

                this.dx += dx;
                this.dy += dy;

                mermaidElement.setCssStyles({
                    transform: `translate(${this.dx}px, ${this.dy}px) scale(${this.scale})`,
                });
            }
        );
        this.view.registerDomEvent(
            container as HTMLElement,
            'mousedown',
            (event: MouseEvent) => {
                if (event.button !== 0) {
                    return;
                }
                this.activeContainer = container;
                const c_html = container as HTMLElement;
                c_html.focus({ preventScroll: true });
                isDragging = true;
                startX = event.clientX;
                startY = event.clientY;

                initialX = this.dx;
                initialY = this.dy;
                mermaidElement.setCssStyles({
                    cursor: 'grabbing',
                });
                event.preventDefault();
            }
        );
        this.view.registerDomEvent(
            container as HTMLElement,
            'mousemove',
            (event: MouseEvent) => {
                if (!isDragging) {
                    return;
                }
                this.activeContainer = container;

                const dx = event.clientX - startX;
                const dy = event.clientY - startY;
                this.dx = initialX + dx;
                this.dy = initialY + dy;
                mermaidElement.setCssStyles({
                    transform: `translate(${this.dx}px, ${this.dy}px) scale(${this.scale})`,
                });
            }
        );
        this.view.registerDomEvent(container as HTMLElement, 'mouseup', () => {
            this.activeContainer = container;
            if (isDragging) {
                isDragging = false;
                mermaidElement.setCssStyles({ cursor: 'grab' });
            }
        });
        this.view.registerDomEvent(
            container as HTMLElement,
            'mouseleave',
            () => {
                this.activeContainer = container;
                if (isDragging) {
                    isDragging = false;
                    mermaidElement.setCssStyles({ cursor: 'grab' });
                }
            }
        );
    }

    /**
     * Manages touch events for the mermaid element in the container.
     * If `nativeTouchEventsEnabled` is true, native touch events are enabled - plugin do not handle them.
     * If `nativeTouchEventsEnabled` is false, native touch events are disabled and touch events are handled by the plugin.
     * @param container - The container element that contains the mermaid element.
     */
    manageTouchEvents(container: HTMLElement): void {
        let startX: number;
        let startY: number;
        let initialDistance: number;
        let isDragging: boolean = false;
        let isPinching: boolean = false;
        const BUTTON_SELECTOR =
            '.mermaid-zoom-panel button, .mermaid-move-panel button, .mermaid-service-panel button';

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
         * Handles the start of a touch event for the mermaid element.
         * @param plugin - The plugin instance.
         * @returns A function that handles the touchstart event.
         */
        function touchStart(plugin: MermaidZoomDragPlugin) {
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
         * Handles the move event for the mermaid element. If the element is being pinched, zoom the element. If the element is being dragged, move it.
         * @param plugin - The plugin instance.
         * @returns A function that handles the touchmove event.
         */
        function touchMove(plugin: MermaidZoomDragPlugin) {
            return function innerTM(e: TouchEvent) {
                if (plugin.nativeTouchEventsEnabled) {
                    return;
                }
                plugin.activeContainer = container;

                e.preventDefault();
                e.stopPropagation();

                const element = container.querySelector(
                    plugin.getCompoundSelector()
                ) as HTMLElement | null;
                if (!element) {
                    return;
                }

                if (isDragging && e.touches.length === 1) {
                    const dx = e.touches[0].clientX - startX;
                    const dy = e.touches[0].clientY - startY;

                    plugin.moveElement(container, dx, dy);

                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                } else if (isPinching && e.touches.length === 2) {
                    const currentDistance = calculateDistance(e.touches);
                    const factor = currentDistance / initialDistance;

                    plugin.zoomElement(container, factor);

                    initialDistance = currentDistance;
                }
            };
        }

        /**
         * Handles the end of a touch event for the mermaid element.
         * @param plugin - The plugin instance.
         * @returns A function that handles the touchend event.
         */
        function touchEnd(plugin: MermaidZoomDragPlugin) {
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
         * Handles the scroll event for the mermaid element.
         * @param plugin - The plugin instance.
         * @returns A function that handles the scroll event.
         */
        function scroll(plugin: MermaidZoomDragPlugin) {
            return function innerScroll(e: Event) {
                if (plugin.nativeTouchEventsEnabled) {
                    return;
                }
                plugin.activeContainer = container;

                e.preventDefault();
                e.stopPropagation();
            };
        }

        const touchStartHandler = touchStart(this);
        const touchMoveHandler = touchMove(this);
        const touchEndHandler = touchEnd(this);
        const scrollHandler = scroll(this);

        // we register the events as a view.registerDomEvent - so plugin can off them on unloading view
        this.view.registerDomEvent(container, 'touchstart', touchStartHandler, {
            passive: false,
        });
        this.view.registerDomEvent(container, 'touchmove', touchMoveHandler, {
            passive: false,
        });
        this.view.registerDomEvent(container, 'touchend', touchEndHandler, {
            passive: false,
        });
        this.view.registerDomEvent(container, 'scroll', scrollHandler, {
            passive: false,
        });
    }

    keyboardHandler(container: HTMLElement) {
        return (e: KeyboardEvent): void => {
            const key = e.key;
            const KEYS = [
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
                '=',
                '+',
                '-',
                '0',
            ];
            if (!KEYS.includes(key)) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            this.activeContainer = container;

            switch (key) {
                case 'ArrowUp':
                    this.moveElement(container, 0, 50, true);
                    break;
                case 'ArrowDown':
                    this.moveElement(container, 0, -50, true);
                    break;
                case 'ArrowLeft':
                    this.moveElement(container, 50, 0, true);
                    break;
                case 'ArrowRight':
                    this.moveElement(container, -50, 0, true);
                    break;
            }

            if (e.ctrlKey) {
                switch (key) {
                    case '=':
                    case '+':
                        this.zoomElement(container, 1.1, true);
                        break;
                    case '-':
                        this.zoomElement(container, 0.9, true);
                        break;
                    case '0':
                        this.resetZoomAndMove(container, true);
                        break;
                }
            }
        };
    }

    initializeView(): void {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }
        if (view.getMode() !== 'preview') {
            return;
        }
        // @ts-ignore
        const leafID = view.leaf.id;
        this.leafID = leafID;
        this.view = view;
        this.initializeMermaidFeatures(this.view.contentEl);
    }

    cleanupView(): void {
        if (this.leafID) {
            const isLeaf = this.app.workspace.getLeafById(this.leafID);
            if (isLeaf === null) {
                this.viewData.removeData(this.leafID!);
                this.leafID = undefined;
            }
        }
    }

    initializeViewData(containerID: ContainerID): void {
        this.viewData.initializeView(this.leafID!, containerID);
    }
}
