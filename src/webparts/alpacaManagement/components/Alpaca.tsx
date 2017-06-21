import * as React from 'react';
import styles from './AlpacaManagement.module.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
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
    private _targetAlpacaElement: any;

    public constructor(props) {
        super(props);
        this.state = {
            isCalloutVisible: false
        };
    };

    @autobind
    private _onShowMenuClicked() {
        this.setState({
            isCalloutVisible: !this.state.isCalloutVisible
        });
    }

    @autobind
    private _onCalloutDismiss() {
        this.setState({
            isCalloutVisible: false
        });
    }

    public render() {
        const { hideSourceOnDrag, left, top, scaleX, hueRotation, saturate, connectDragSource, isDragging, children } = this.props;
        let { isCalloutVisible } = this.state;
        if (isDragging && hideSourceOnDrag) {
            return null;
        }

        return connectDragSource(
            <div className={styles.alpaca}
                title={this.props.alpaca.displayName}
                style={{ left, top, transform: `scaleX(${scaleX})`, filter: `hue-rotate(${hueRotation}deg) saturate(${saturate})` }}
                onClick={this._onShowMenuClicked}
                ref={(alpaca) => this._targetAlpacaElement = alpaca}>
                {children}
                {isCalloutVisible ? (
                    <Callout
                        backgroundColor={"rgba(255, 255, 255, 0.8)"}
                        className={styles.alpacaCallout}
                        targetElement={this._targetAlpacaElement}
                        isBeakVisible={true}
                        beakWidth={10}
                        onDismiss={this._onCalloutDismiss}
                        directionalHint={DirectionalHint.rightCenter}
                    >
                        <div className={styles.alpacaCalloutHeader}>
                            <p className={styles.alpacaCalloutTitle}>
                                {this.props.alpaca.displayName}
                            </p>
                        </div>
                        <div className={styles.alpacaCalloutBody}>
                            <div>
                                <p>
                                    {this.props.alpaca.mail}
                                </p>
                            </div>
                        </div>
                    </Callout>
                ) : (null)}
            </div>
        );
    }
}