import * as React from 'react';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaProps } from './IAlpacaProps';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
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
    public constructor(props) {
        super(props);
        this.state = {
            isCalloutVisible: false
        };

    };

    public render() {
        const {
            alpaca,
            hideSourceOnDrag,
            left,
            top,
            scaleX,
            hueRotation,
            saturate,
            connectDragSource,
            isDragging,
            children
        } = this.props;

        const { isCalloutVisible } = this.state;
        if (isDragging && hideSourceOnDrag) {
            return null;
        }

        return connectDragSource(
            <div className={styles.alpaca}
                title={alpaca.displayName}
                style={{ left, top, transform: `scaleX(${scaleX})`, filter: `hue-rotate(${hueRotation}deg) saturate(${saturate})` }}
                onClick={() => this.setState((prevState, props) => ({ isCalloutVisible: !prevState.isCalloutVisible}))}
                ref={(e) => this.state.targetAlpacaElement = e}
                >
                {children}
                {isCalloutVisible ? (
                    <Callout
                        backgroundColor={"rgba(255, 255, 255, 0.8)"}
                        className={styles.alpacaCallout}
                        targetElement={this.state.targetAlpacaElement}
                        isBeakVisible={true}
                        beakWidth={10}
                        onDismiss={() => this.setState({isCalloutVisible: false})}
                        directionalHint={DirectionalHint.rightCenter}
                    >
                        <div className={styles.alpacaCalloutHeader}>
                            <p className={styles.alpacaCalloutTitle}>
                                {alpaca.displayName}
                            </p>
                        </div>
                        <div className={styles.alpacaCalloutBody}>
                            <div>
                                <p>
                                    {alpaca.mail}
                                </p>
                            </div>
                        </div>
                    </Callout>
                ) : (null)}
            </div>
        );
    }
}