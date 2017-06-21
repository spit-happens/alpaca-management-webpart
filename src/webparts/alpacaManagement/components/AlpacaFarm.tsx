import * as React from 'react';
import * as update from 'react/lib/update';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaFarmProps } from './IAlpacaFarmProps';
import { IAlpacaFarmState } from './IAlpacaFarmState';
import { Log } from '@microsoft/sp-core-library';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Alpaca from './Alpaca';
import AlpacaFarmAnimalTypes from './AlpacaFarmAnimalTypes';
import * as _ from 'lodash';

const alpacaTarget = {
    drop(props, monitor, component) {
        const item = monitor.getItem();
        const delta = monitor.getDifferenceFromInitialOffset();
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);

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
            alpaca: []
        }
    }

    public async componentDidMount() {
        console.log(this.props.alpaca);
        let filteredAlpaca = _.remove(this.props.alpaca, (a: any) => {

            if (!a.displayName.match(/.*mailbox.*/i)) {
                return true;
            }
        });

        filteredAlpaca.forEach(alpaca => {
            alpaca.left = _.random(0, 700);
            alpaca.top = _.random(0, 500);
        });

        let mappedAlpaca = _.zipObject(_.map(filteredAlpaca, "id"), filteredAlpaca);

        this.setState({
            alpaca: mappedAlpaca
        });
    }

    moveAlpaca(id, left, top) {
        console.log(id + " " + left + " " + top);
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
                        const alpaca = this.state.alpaca[key];

                        return (
                            <Alpaca key={`${key}`} id={`${key}`} alpaca={alpaca} left={alpaca.left} top={alpaca.top} />
                        );
                    })
                }
            </div>
        );
    }
}