import * as React from 'react';
import * as update from 'react/lib/update';
import styles from './AlpacaManagement.module.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IAlpacaFarmProps } from './IAlpacaFarmProps';
import { IAlpacaFarmState } from './IAlpacaFarmState';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Alpaca from './Alpaca';
import AlpacaPen from './AlpacaPen';
import AlpacaFarmAnimalTypes from './AlpacaFarmAnimalTypes';
import * as _ from 'lodash';

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

        props.moveAlpaca(item.id, left, top);
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
            spaceLettuce: randomSpaceLettuce
        });
    }

    @autobind
    private alpacaDropped(id, targetTitle) {
        this.props.alpacaDropped(id, targetTitle);
    }

    public render(): React.ReactElement<IAlpacaFarmProps> {
        const { spaceLettuce } = this.state;
        const { alpaca, hideSourceOnDrag, connectDropTarget, children } = this.props;

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
                <AlpacaPen title={"Good Alpaca"} left={100} top={525} dropColor="green" alpacaDropped={this.alpacaDropped} />
                <AlpacaPen title={"Bad Alpaca"} left={370} top={580} dropColor="red" alpacaDropped={this.alpacaDropped} />
            </div>
        );
    }
}