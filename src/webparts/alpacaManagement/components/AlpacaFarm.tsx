import * as React from 'react';
import * as update from 'react/lib/update';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaFarmProps } from './IAlpacaFarmProps';
import { IAlpacaFarmState } from './IAlpacaFarmState';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Alpaca from './Alpaca';
import AlpacaFarmAnimalTypes from './AlpacaFarmAnimalTypes';
import * as _ from 'lodash';

const alpacaTarget = {
    drop(props, monitor, component) {
        const item = monitor.getItem();
        let left = item.left, top = item.top;
        const hasDroppedOnChild = monitor.didDrop();

        if (!hasDroppedOnChild) {
            const delta = monitor.getDifferenceFromInitialOffset();
            left = Math.round(item.left + delta.x);
            top = Math.round(item.top + delta.y);
        }

        component.moveAlpaca(item.id, left, top);
    },
};

@DragDropContext(HTML5Backend)
@DropTarget(AlpacaFarmAnimalTypes.Alpaca, alpacaTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))
export default class AlpacaFarm extends React.Component<IAlpacaFarmProps, IAlpacaFarmState> {
    public constructor(props) {
        super(props);

        this.state = {
            alpaca: {},
            spaceLettuce: []
        };
    }

    public async componentDidMount() {

        Object.keys(this.props.alpaca).forEach(id => {
            let alpaca = this.props.alpaca[id];

            alpaca.left = _.random(0, 700 - 25);
            alpaca.top = _.random(0, 500);
            alpaca.scaleX = _.random(1, 2) == 2 ? -1 : 1;
            alpaca.hueRotation = 0; //_.random(0, 360);
            alpaca.saturate = _.random(0.5, 2, true);
        });

        let randomSpaceLettuce = [];

        for (let i = 0; i < _.random(4, 10); i++) {
            randomSpaceLettuce.push({
                left: _.random(0, 700 - 25),
                top: _.random(0, 500),
                saturate: _.random(0.5, 2, true)
            });
        }

        this.setState({
            alpaca: this.props.alpaca,
            spaceLettuce: randomSpaceLettuce
        });
    }

    private moveAlpaca(id, left, top) {
        if (!this.state.alpaca[id]) {
            return;
        }
        this.setState(update(this.state, {
            alpaca: {
                [id]: {
                    $merge: { left, top },
                },
            },
        }));
    }

    public render(): React.ReactElement<IAlpacaFarmProps> {
        const { alpaca, spaceLettuce } = this.state;
        const { hideSourceOnDrag, connectDropTarget } = this.props;

        if (!alpaca || Object.keys(alpaca).length == 0) {
            return (
                <div className={styles.alpacaFarm}>
                </div>
            );
        }

        let spaceLettuceCount = 0;
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
                            <Alpaca key={`${key}`} id={`${key}`} alpaca={currentAlpaca} left={currentAlpaca.left} top={currentAlpaca.top} scaleX={currentAlpaca.scaleX} hueRotation={currentAlpaca.hueRotation} saturate={currentAlpaca.saturate} />
                        );
                    })
                }
                {this.props.children}
            </div>
        );
    }
}