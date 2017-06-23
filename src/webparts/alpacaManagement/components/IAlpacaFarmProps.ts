import { IUser } from './AlpacaTypes';

export interface IAlpacaFarmProps {
    hideSourceOnDrag?: boolean;
    connectDropTarget?: (any) => any;
    alpaca: { [id: string]: IUser };
    spaceLettuce: Array<any>;
    alpacaPens: Array<any>;
    moveAlpaca: (id: string, left: number, top: number) => void;
    alpacaDropped: (id: string, penTitle: string) => void;
}