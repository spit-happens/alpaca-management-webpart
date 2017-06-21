export interface IAlpacaPenProps {
    connectDropTarget?: (any) => any;
    isOver?: boolean;
    isOverCurrent?: boolean;
    greedy?: boolean;
    title: string;
    children?: any;
    left: number;
    top: number;
    alpacaDropped: (id: string, penTitle: string) => void;
    backgroundColor?: string;
    dropColor?: string;
}