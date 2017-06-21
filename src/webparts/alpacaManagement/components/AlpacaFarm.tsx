import * as React from 'react';
import * as update from 'react/lib/update';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaFarmProps } from './IAlpacaFarmProps';
import { IAlpacaFarmState } from './IAlpacaFarmState';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Alpaca from './Alpaca';
import AlpacaPen from './AlpacaPen';
import AlpacaFarmAnimalTypes from './AlpacaFarmAnimalTypes';
import * as _ from 'lodash';

const alpacaTarget = {
    drop(props, monitor, component) {
        const item = monitor.getItem();
        let left = item.left, top = item.top;
        const hasDroppedOnChild = monitor.didDrop();

        if (hasDroppedOnChild) {
        } else {
            const delta = monitor.getDifferenceFromInitialOffset();
            left = Math.round(item.left + delta.x);
            top = Math.round(item.top + delta.y);
        }

        component.moveAlpaca(item.id, left, top, hasDroppedOnChild);
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
            alpaca: []
        };
    }

    public async componentDidMount() {
        let filteredAlpaca = _.remove(this.props.alpaca, (a: any) => {

            if (!a.displayName.match(/.*mailbox.*/i)) {
                return true;
            }
        });

        filteredAlpaca.forEach(alpaca => {
            alpaca.left = _.random(0, 700 - 25);
            alpaca.top = _.random(0, 500);
        });

        let mappedAlpaca = _.zipObject(_.map(filteredAlpaca, "id"), filteredAlpaca);

        this.setState({
            alpaca: mappedAlpaca
        });
    }

    private alpacaDropped(id, targetTitle) {
        let wanderingAlpaca = this.state.alpaca[id];
        if (!wanderingAlpaca) {
            return;
        }

        _.unset(this.state.alpaca, id);

        switch (targetTitle) {
            case "Good Alpaca":
                this.props.goodAlpacaAdded(wanderingAlpaca);
                break;
            case "Bad Alpaca":
                this.props.badAlpacaAdded(wanderingAlpaca);
                break;
        }

        //TODO: increase perf of this using update combined with $push etc...

        this.setState({
            alpaca: this.state.alpaca
        });
    }

    private moveAlpaca(id, left, top, hasDroppedOnChild) {
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
        const { alpaca } = this.state;
        const { hideSourceOnDrag, connectDropTarget } = this.props;

        if (!alpaca || alpaca.length == 0) {
            return (
                <div className={styles.alpacaFarm}>
                </div>
            );
        }

        return connectDropTarget(
            <div className={styles.alpacaFarm}>
                {
                    Object.keys(alpaca).map((key) => {
                        const currentAlpaca = this.state.alpaca[key];

                        return (
                            <Alpaca key={`${key}`} id={`${key}`} alpaca={currentAlpaca} left={currentAlpaca.left} top={currentAlpaca.top} />
                        );
                    })
                }
                <AlpacaPen title={"Good Alpaca"} left={100} top={525} farm={this} />
                <AlpacaPen title={"Bad Alpaca"} left={370} top={580} dropColor="red" farm={this} />
            </div>
        );
    }
}