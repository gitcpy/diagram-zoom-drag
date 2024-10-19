export interface DiagramData {
    name: string;
    selector: string;
}

export interface DEFAULT_SETTINGS {
    supported_diagrams: DiagramData[];
    itemsPerPage: number;
    foldByDefault: boolean;
    automaticFolding: boolean;
    hideOnMouseOutDiagram: boolean;
    hideOnMouseOutPanels: boolean;
}
