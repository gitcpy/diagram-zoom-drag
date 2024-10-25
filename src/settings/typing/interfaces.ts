export interface DiagramData {
    name: string;
    selector: string;
    on: boolean;
}

export interface DefaultSettings {
    supported_diagrams: DiagramData[];
    diagramsPerPage: number;
    foldingByDefault: boolean;
    automaticFoldingOnFocusChange: boolean;
    hideOnMouseOutDiagram: boolean;
    hideOnMouseOutPanels: boolean;
}
