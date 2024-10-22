import { moment } from 'obsidian';
import { DiagramContextMenu } from '../diagram-context-menu';

export class Export {
    constructor(private diagramContextMenu: DiagramContextMenu) {}

    export(container: HTMLElement): void {
        const element: HTMLElement | null = container.querySelector(
            this.diagramContextMenu.diagram.compoundSelector
        );

        if (!element) {
            return;
        }

        const svg = element.querySelector('svg');
        const img = element.querySelector('img');

        console.log(element.querySelectorAll('svg'));
        console.log(element.querySelectorAll('img'));
        if (svg) {
            this.exportSVG(svg);
        } else if (img) {
            this.exportIMG(img);
        } else {
            console.error('Neither SVG nor IMG element found in the container');
        }
    }

    private exportSVG(svg: SVGElement): void {
        const svgData = new XMLSerializer().serializeToString(svg);
        const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        const svgBlob = new Blob([preface, svgData], {
            type: 'image/svg+xml;charset=utf-8',
        });
        this.downloadFile(svgBlob, 'svg');
    }
    private exportIMG(img: HTMLImageElement): void {
        fetch(img.src)
            .then((response) => response.blob())
            .then((blob) => {
                debugger;

                this.downloadFile(blob, `png`);
            })
            .catch((error) => console.error('Error exporting image:', error));
    }

    private downloadFile(blob: Blob, extension: string): void {
        const { diagram } = this.diagramContextMenu;
        const filename = `dzg_export_${diagram.plugin.view?.file?.basename ?? 'diagram'}_${diagram.activeContainer?.id ?? 'unknown'}}_${moment().format('YYYYMMDDHHmmss')}.${extension}`;
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }
}
