import { IUser } from './AlpacaTypes';

export interface IAlpacaFarmProps {
    hideSourceOnDrag?: boolean;
    connectDropTarget?: (any) => any;
    farmSize: number,
    alpaca: { [id: string]: IUser };
    spaceLettuce: Array<any>;
    alpacaPens: Array<any>;
    alpacaClicked?: (id: string) => void;
    alpacaMoved?: (id: string, left: number, top: number) => void;
    alpacaDropped?: (id: string, penTitle: string) => void;
    alpacaCalloutDismissed?: (id: string) => void;
}