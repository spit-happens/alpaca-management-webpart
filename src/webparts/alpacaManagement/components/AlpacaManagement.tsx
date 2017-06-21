import * as React from 'react';
import * as update from 'react/lib/update';
import AlpacaPen from './AlpacaPen';
import AlpacaFarm from './AlpacaFarm';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaManagementProps } from './IAlpacaManagementProps';
import { IAlpacaManagementState } from './IAlpacaManagementState';
import { escape } from '@microsoft/sp-lodash-subset';
import { Log } from '@microsoft/sp-core-library';
import { PrimaryButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Client as GraphClient } from '@microsoft/microsoft-graph-client';
import * as URI from 'urijs';
import * as _ from 'lodash';

export default class AlpacaManagement extends React.Component<IAlpacaManagementProps, IAlpacaManagementState> {
    private _targetBadAlpacaCalloutElement: any;
    private _targetGoodAlpacaCalloutElement: any;

    public constructor(props) {
        super(props);

        this.state = {
            loading: false,
            me: [],
            users: {},
            goodAlpaca: {},
            badAlpaca: {},
            isGoodAlpacaCalloutVisible: false,
            isBadAlpacaCalloutVisible: false
        };
        Log.info("Alpaca Management", "Initialized");
    }

    public async componentDidMount() {
        this.getAlpacas();
    }

    @autobind
    public async getAlpacas() {
        this.setState({
            loading: true
        });

        let clientId = "b1cac966-3175-4abb-9bae-5514235fcdab";
        let desiredScope = ["User.Read", "User.ReadWrite", "User.ReadBasic.All", "People.Read"];

        let currentUri = URI();
        let currentHashParts = URI(currentUri.hash().replace('#', '?'));
        let authEndpointUri = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?\
client_id=${clientId}\
&response_type=token\
&redirect_uri=${currentUri.search('').fragment('').href()}\
&scope=${desiredScope.join('%20')}`;

        if (!currentHashParts.hasQuery("access_token")) {
            window.location.href = authEndpointUri;
        }

        //TODO: Store the access token and other info in state.

        let accessToken = currentHashParts.query(true)['access_token'];
        let client = GraphClient.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });

        try {
            let meResult = await client.api('/me')
                .get();

            Log.info("Alpaca Management", `UserInfo: ${meResult}`);

            let usersResult = await client.api('/users')
                .top(500)
                .get();

            Log.info("Alpaca Management", `${usersResult.length} users retrieved.`);

            //Filter users
            let filteredUsers = _.remove(usersResult.value, (a: any) => {

                if (!a.displayName.match(/.*mailbox.*/i)) {
                    return true;
                }
            });

            let mappedUsers = _.zipObject(_.map(filteredUsers, "id"), filteredUsers);

            this.setState({
                loading: false,
                me: meResult.value,
                users: mappedUsers,
                goodAlpaca: [],
                badAlpaca: []
            });
        }
        catch (ex) {
            //An error occurred, redirect to the auth endpoint.
            window.location.href = authEndpointUri;
        }
    }

    @autobind
    private alpacaDropped(id: string, penTitle: string): void {
        let wanderingAlpaca = this.state.users[id];
        if (!wanderingAlpaca) {
            return;
        }

        _.unset(this.state.users, id);

        switch (penTitle) {
            case "Good Alpaca":
                this.state.goodAlpaca[id] = wanderingAlpaca;
                this.setState({
                    goodAlpaca: this.state.goodAlpaca
                });
                break;
            case "Bad Alpaca":
                this.state.badAlpaca[id] = wanderingAlpaca;
                this.setState({
                    badAlpaca: this.state.badAlpaca
                });
                break;
        }

        //TODO: increase perf of this using update combined with $merge etc...

        this.setState({
            users: this.state.users
        });
    }

    @autobind
    public putBackAlpaca(alpaca, penTitle) {
        switch (penTitle) {
            case "Good Alpaca":
                _.unset(this.state.goodAlpaca, alpaca.id);
                this.setState({
                    goodAlpaca: this.state.goodAlpaca
                });
                break;
            case "Bad Alpaca":
                _.unset(this.state.badAlpaca, alpaca.id);
                this.setState({
                    badAlpaca: this.state.badAlpaca
                });
                break;
        }

        this.state.users[alpaca.id] = alpaca;
        this.setState({
            users: this.state.users
        });
    }

    public render(): React.ReactElement<IAlpacaManagementProps> {
        if (this.state.loading) {
            return (
                <Spinner size={SpinnerSize.large} label='Loading Alpacas...' />
            );
        }

        const { isBadAlpacaCalloutVisible, isGoodAlpacaCalloutVisible, badAlpaca, goodAlpaca } = this.state;

        return (
            <div className={styles.alpacaManagement}>
                <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.headerRow}`}>
                    <div className="ms-Grid-col ms-u-sm12">
                        <span className="ms-font-xl ms-fontColor-white">{escape(this.props.description)}</span>
                    </div>
                </div>
                <AlpacaFarm alpaca={this.state.users}>
                    <AlpacaPen title={"Good Alpaca"} left={100} top={525} dropColor="green" alpacaDropped={this.alpacaDropped} />
                    <AlpacaPen title={"Bad Alpaca"} left={370} top={580} dropColor="red" alpacaDropped={this.alpacaDropped} />
                </AlpacaFarm>
                <div className={`ms-Grid-row ${styles.footerRow}`}>
                    <div className="ms-Grid-col ms-u-sm4" ref={(e) => this._targetGoodAlpacaCalloutElement = e} onClick={() => this.setState({ isGoodAlpacaCalloutVisible: !this.state.isGoodAlpacaCalloutVisible })}>
                        # of Good Alpaca: {Object.keys(this.state.goodAlpaca).length}
                    </div>
                    <div className="ms-Grid-col ms-u-sm4" ref={(e) => this._targetBadAlpacaCalloutElement = e} onClick={() => this.setState({ isBadAlpacaCalloutVisible: !this.state.isBadAlpacaCalloutVisible })}>
                        # of Bad Alpaca: {Object.keys(this.state.badAlpaca).length}
                    </div>
                    <div className="ms-Grid-col ms-u-sm4">
                        <PrimaryButton
                            text='Refresh Alpacas'
                            onClick={this.getAlpacas}
                            iconProps={{ iconName: 'Refresh' }}
                            style={{ float: "right" }}
                        />
                    </div>
                </div>
                {isGoodAlpacaCalloutVisible ? (
                    <Callout
                        className={styles.alpacaCountCallout}
                        targetElement={this._targetGoodAlpacaCalloutElement}
                        isBeakVisible={true}
                        beakWidth={10}
                        onDismiss={() => this.setState({ isGoodAlpacaCalloutVisible: false })}
                        directionalHint={DirectionalHint.topAutoEdge}
                    >
                        <div className={styles.alpacaCountCalloutHeader}>
                            <p className={styles.alpacaCountCalloutTitle}>
                                Good Alpaca
                            </p>
                        </div>
                        <div className={styles.alpacaCountCalloutBody}>
                            {
                                Object.keys(goodAlpaca).map(id => {
                                    let currentAlpaca = goodAlpaca[id];
                                    return (
                                        <div key={currentAlpaca.id} title={currentAlpaca.displayName} onClick={() => this.putBackAlpaca(currentAlpaca, "Good Alpaca")} className={styles.alpaca} style={{ float: "left", cursor: "pointer", position: "relative" }} />
                                    );
                                })
                            }
                        </div>
                    </Callout>
                ) : (null)}
                {isBadAlpacaCalloutVisible ? (
                    <Callout
                        className={styles.alpacaCountCallout}
                        targetElement={this._targetBadAlpacaCalloutElement}
                        isBeakVisible={true}
                        beakWidth={10}
                        onDismiss={() => this.setState({ isBadAlpacaCalloutVisible: false })}
                        directionalHint={DirectionalHint.topAutoEdge}
                    >
                        <div className={styles.alpacaCountCalloutHeader}>
                            <p className={styles.alpacaCountCalloutTitle}>
                                Bad Alpaca
                            </p>
                        </div>
                        <div className={styles.alpacaCountCalloutBody}>
                            {
                                Object.keys(badAlpaca).map(id => {
                                    let currentAlpaca = badAlpaca[id];
                                    return (
                                        <div key={currentAlpaca.id} title={currentAlpaca.displayName} onClick={() => this.putBackAlpaca(currentAlpaca, "Bad Alpaca")} className={styles.alpaca} style={{ float: "left", cursor: "pointer", position: "relative" }} />
                                    );
                                })
                            }
                        </div>
                    </Callout>
                ) : (null)}
            </div>
        );
    }
}
