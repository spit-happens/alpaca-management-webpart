import * as React from 'react';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaProps } from './IAlpacaProps';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { DragSource } from 'react-dnd';
import AlpacaFarmObjectTypes from './AlpacaFarmObjectTypes';

const alpacaSource = {
    beginDrag(props: IAlpacaProps) {
        return {
            id: props.alpaca.id,
            left: props.alpaca.style.left,
            top: props.alpaca.style.top
        };
    },
};

@DragSource(AlpacaFarmObjectTypes.Alpaca, alpacaSource, (connect, monitor) => ({
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
            connectDragSource,
            isDragging,
            children
        } = this.props;

        const style = alpaca.style;
        const { isCalloutVisible } = this.state;
        if (isDragging && hideSourceOnDrag) {
            return null;
        }

        return connectDragSource(
            <div className={styles.alpaca}
                title={alpaca.displayName}
                style={{ left: style.left, top: style.top, transform: `scaleX(${style.scaleX})`, filter: `hue-rotate(${style.hueRotation}deg) saturate(${style.saturate})` }}
                onClick={() => this.setState((prevState, props) => ({ isCalloutVisible: !prevState.isCalloutVisible }))}
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
                        onDismiss={() => this.setState({ isCalloutVisible: false })}
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