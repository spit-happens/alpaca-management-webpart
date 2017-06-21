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
        const { hideSourceOnDrag, left, top, connectDragSource, isDragging, children } = this.props;
        let { isCalloutVisible } = this.state;
        if (isDragging && hideSourceOnDrag) {
            return null;
        }

        return connectDragSource(
            <div className={styles.alpaca}
                title={this.props.alpaca.displayName}
                style={{ left, top }}
                onClick={this._onShowMenuClicked}
                ref={(alpaca) => this._targetAlpacaElement = alpaca}>
                {children}
                {isCalloutVisible ? (
                    <Callout
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
                        <div className='ms-CalloutExample-inner'>
                            <div className='ms-CalloutExample-content'>
                                <p className='ms-CalloutExample-subText'>
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