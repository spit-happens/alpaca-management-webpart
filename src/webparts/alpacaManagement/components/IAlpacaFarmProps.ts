export interface IAlpacaFarmProps {
    hideSourceOnDrag?: boolean;
    connectDropTarget?: (any) => any;
    alpaca: object;
    alpacaDropped: (id: string, penTitle: string) => void;
}