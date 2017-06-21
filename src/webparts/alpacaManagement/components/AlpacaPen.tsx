import * as React from 'react';
import { IAlpacaPenProps } from './IAlpacaPenProps';
import { DropTarget } from 'react-dnd';
import AlpacaFarmAnimalTypes from './AlpacaFarmAnimalTypes';

const style = {
    border: '1px dashed rgba(0,0,0,0.6)',
    minWidth: '8rem',
    color: 'white',
    padding: '2rem',
    paddingTop: '1rem',
    margin: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    position: 'absolute'
};

const penTarget = {
    drop(props, monitor, component) {
        const hasDroppedOnChild = monitor.didDrop();
        if (hasDroppedOnChild && !props.greedy) {
            return;
        }

        const item = monitor.getItem();
        props.alpacaDropped(item.id, props.title);

        component.setState({
            hasDropped: true
        });
    },
};

@DropTarget(AlpacaFarmAnimalTypes.Alpaca, penTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
}))
export default class AlpacaPen extends React.Component<IAlpacaPenProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            hasDropped: false,
        };
    }

    public render() {
        const { title, greedy, isOver, isOverCurrent, connectDropTarget, left, top, children } = this.props;
        const { hasDropped } = this.state;

        let backgroundColor = this.props.backgroundColor || 'rgba(0, 0, 0, .5)';

        if (isOverCurrent || (isOver && greedy)) {
            backgroundColor = this.props.dropColor || 'darkgreen';
        }

        if (hasDropped === true) {
            setTimeout(() => {
                this.setState({
                    hasDropped: false,
                });
            }, 3 * 1000);
        }

        return connectDropTarget(
            <div style={{ ...style, left, top, backgroundColor }}>
                {title}
                <br />
                {hasDropped &&
                    <span>dropped</span>
                }

                <div>
                    {children}
                </div>
            </div>,
        );
    }
}