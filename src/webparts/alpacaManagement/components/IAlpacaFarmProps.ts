export interface IAlpacaFarmProps {
    hideSourceOnDrag?: boolean;
    connectDropTarget?: (any) => any;
    alpaca: object;
    moveAlpaca: (id: string, left: number, top: number) => void;
    alpacaDropped: (id: string, penTitle: string) => void;
}