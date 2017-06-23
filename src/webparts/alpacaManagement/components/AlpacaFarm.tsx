import * as React from 'react';
import * as update from 'react/lib/update';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaFarmProps } from './IAlpacaFarmProps';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Alpaca from './Alpaca';
import AlpacaPen from './AlpacaPen';
import AlpacaFarmObjectTypes from './AlpacaFarmObjectTypes';

const alpacaTarget = {
    drop(props: IAlpacaFarmProps, monitor, component) {
        const item = monitor.getItem();
        let left = item.left, top = item.top;
        const hasDroppedOnChild = monitor.didDrop();

        if (!hasDroppedOnChild) {
            const delta = monitor.getDifferenceFromInitialOffset();
            left = Math.round(item.left + delta.x);
            top = Math.round(item.top + delta.y);
        }

        props.alpacaMoved(item.id, left, top);
    },
};

@DragDropContext(HTML5Backend)
@DropTarget(AlpacaFarmObjectTypes.Alpaca, alpacaTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))
export default class AlpacaFarm extends React.Component<IAlpacaFarmProps, void> {
    public render(): React.ReactElement<IAlpacaFarmProps> {

        const { alpaca, spaceLettuce, alpacaPens, hideSourceOnDrag, connectDropTarget, children } = this.props;

        let spaceLettuceCount = 0;
        let alpacaPenCount = 0;
        return connectDropTarget(
            <div className={styles.alpacaFarm}>
                {
                    spaceLettuce.map((currentSpaceLettuce) => {
                        return (
                            <div key={spaceLettuceCount++} className={styles.spaceLettuce} style={{ left: currentSpaceLettuce.left, top: currentSpaceLettuce.top }} />
                        );
                    })
                }

                {
                    Object.keys(alpaca).map((key) => {
                        const currentAlpaca = alpaca[key];

                        return (
                            <Alpaca key={`${key}`} alpaca={currentAlpaca} alpacaClicked={this.props.alpacaClicked} alpacaCalloutDismissed={this.props.alpacaCalloutDismissed}/>
                        );
                    })
                }

                {
                    alpacaPens.map((alpacaPen) => {
                        return (
                            <AlpacaPen key={alpacaPenCount++} title={alpacaPen.title} left={alpacaPen.left} top={alpacaPen.top} dropColor={alpacaPen.dropColor} alpacaDropped={this.props.alpacaDropped} />
                        );
                    })
                }
            </div>
        );
    }
}