import * as React from 'react';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaProps } from './IAlpacaProps';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import AlpacaFarmAnimalTypes from './AlpacaFarmAnimalTypes';

const alpacaSource = {
    beginDrag(props) {
        const { id, left, top } = props;
        return { id, left, top };
    },
};

@DragSource(AlpacaFarmAnimalTypes.Alpaca, alpacaSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}))
export default class Alpaca extends React.Component<IAlpacaProps, any> {
    public render() {
        const { hideSourceOnDrag, left, top, connectDragSource, isDragging, children } = this.props;
        if (isDragging && hideSourceOnDrag) {
            return null;
        }

        return connectDragSource(
            <div className={styles.alpaca} title={this.props.alpaca.displayName} style={{ left, top }}>
                {children}
            </div>,
        );
    }
}