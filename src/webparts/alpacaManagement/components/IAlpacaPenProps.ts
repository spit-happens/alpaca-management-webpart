export interface IAlpacaPenProps {
    connectDropTarget?: (any) => any;
    isOver?: boolean;
    isOverCurrent?: boolean;
    greedy?: boolean;
    title: string;
    children?: any;
    left: number;
    top: number;
    farm: any;
    backgroundColor?: string;
    dropColor?: string;
}