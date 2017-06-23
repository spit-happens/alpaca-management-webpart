import { IUser } from './AlpacaTypes';

export interface IAlpacaProps {
    connectDragSource?: (any) => any;
    isDragging?: boolean;
    hideSourceOnDrag?: boolean;
    alpaca: IUser;
    alpacaClicked?: (id: string) => void;
    alpacaCalloutDismissed?: (id: string) => void;
}