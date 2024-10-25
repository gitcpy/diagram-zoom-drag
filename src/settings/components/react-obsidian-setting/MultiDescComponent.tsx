import React, { Component } from 'react';

interface MultiDescProps {
    containerEl?: HTMLDivElement;
}

export class MultiDescComponent extends Component<MultiDescProps> {
    private element: HTMLDivElement | null = null;

    constructor(props: MultiDescProps) {
        super(props);
        if (props.containerEl) {
            this.element = props.containerEl;
        }
    }

    componentDidMount(): void {
        const div = document.createElement('div');
        this.element = div;

        if (this.props.containerEl) {
            this.props.containerEl.appendChild(div);
        }
    }

    addDescriptions(desc: string[]): this {
        if (this.element) {
            this.element.innerHTML = desc
                .map((d) => `<div>${d}</div>`)
                .join('');
            return this;
        }
        return this;
    }

    render(): null {
        return null;
    }
}
