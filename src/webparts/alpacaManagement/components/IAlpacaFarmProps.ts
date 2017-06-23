export interface IAlpacaFarmProps {
    hideSourceOnDrag?: boolean;
    connectDropTarget?: (any) => any;
    alpaca: object;
    spaceLettuce: Array<any>;
    alpacaPens: Array<any>;
    moveAlpaca: (id: string, left: number, top: number) => void;
    alpacaDropped: (id: string, penTitle: string) => void;
}