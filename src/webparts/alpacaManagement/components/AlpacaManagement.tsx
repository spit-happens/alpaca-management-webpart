import * as React from 'react';
import * as update from 'react/lib/update';
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
import * as localforage from 'localforage';

const GoodAlpacaStorageKey = "alpaca-management-good-alpaca";
const BadAlpacaStorageKey = "alpaca-management-bad-alpaca";
const AlpacaManagementAccessTokenStorageKey = "alpaca-management-access-token";

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
    public async refreshAlpacas() {
        await localforage.removeItem(GoodAlpacaStorageKey);
        await localforage.removeItem(BadAlpacaStorageKey);
        await this.getAlpacas();
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

        let accessTokenObj: any = await localforage.getItem(AlpacaManagementAccessTokenStorageKey);
        if (!accessTokenObj && !currentHashParts.hasQuery("access_token")) {
            window.location.href = authEndpointUri;
        }

        //TODO: Store the access token and other info in state.
        if (!accessTokenObj) {
            accessTokenObj = {};
        }

        let accessToken = accessTokenObj.accessToken || currentHashParts.query(true)['access_token'];
        let client = GraphClient.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });

        let meResult, usersResult;
        try {
            meResult = await client.api('/me')
                .get();

            Log.info("Alpaca Management", `UserInfo: ${meResult}`);

            usersResult = await client.api('/users')
                .top(500)
                .get();

            Log.info("Alpaca Management", `${usersResult.value.length} users retrieved.`);
        }
        catch (ex) {
            //An error occurred, redirect to the auth endpoint.
            window.location.href = authEndpointUri;
        }

        //Update stored access token
        await localforage.setItem(AlpacaManagementAccessTokenStorageKey, { accessToken: accessToken });

        //Filter users
        let filteredUsers = _.remove(usersResult.value, (a: any) => {
            if (!a.displayName.match(/.*mailbox.*/i)) {
                return true;
            }
        });

        let mappedUsers = _.zipObject(_.map(filteredUsers, "id"), filteredUsers);

        let storedGoodAlpaca = await localforage.getItem(GoodAlpacaStorageKey);
        let storedBadAlpaca = await localforage.getItem(BadAlpacaStorageKey);

        let goodAlpaca = {}, badAlpaca = {};
        Object.keys(mappedUsers).map((userId) => {
            if (storedGoodAlpaca && storedGoodAlpaca[userId]) {
                goodAlpaca[userId] = mappedUsers[userId];
                _.unset(mappedUsers, userId);
            } else if (storedBadAlpaca && storedBadAlpaca[userId]) {
                badAlpaca[userId] = mappedUsers[userId];
                _.unset(mappedUsers, userId);
            }
        });

        this.setState({
            loading: false,
            me: meResult.value,
            users: mappedUsers,
            goodAlpaca: goodAlpaca,
            badAlpaca: badAlpaca
        });
    }

    @autobind
    private moveAlpaca(id: string, left: number, top: number): void {
        if (!this.state.users[id]) {
            return;
        }
        this.setState(update(this.state, {
            users: {
                [id]: {
                    $merge: { left, top },
                },
            },
        }));
    }

    @autobind
    private async alpacaDropped(id: string, penTitle: string): Promise<void> {
        const wanderingAlpaca = this.state.users[id];
        if (!wanderingAlpaca) {
            return;
        }

        this.setState((prevState, props) => {
            _.unset(prevState.users, id);
            return {
                users: prevState.users
            };
        });

        switch (penTitle) {
            case "Good Alpaca":
                this.state.goodAlpaca[id] = wanderingAlpaca;
                await localforage.setItem(GoodAlpacaStorageKey, this.state.goodAlpaca);
                this.setState({
                    goodAlpaca: this.state.goodAlpaca
                });
                break;
            case "Bad Alpaca":
                this.state.badAlpaca[id] = wanderingAlpaca;
                await localforage.setItem(BadAlpacaStorageKey, this.state.badAlpaca);
                this.setState({
                    badAlpaca: this.state.badAlpaca
                });
                break;
            default:
                throw Error("Unexpected penTitle: " + penTitle);
        }
    }

    @autobind
    public async putBackAlpaca(alpaca, penTitle) {
        switch (penTitle) {
            case "Good Alpaca":
                _.unset(this.state.goodAlpaca, alpaca.id);
                await localforage.setItem(GoodAlpacaStorageKey, this.state.goodAlpaca);
                this.setState({
                    goodAlpaca: this.state.goodAlpaca
                });
                break;
            case "Bad Alpaca":
                _.unset(this.state.badAlpaca, alpaca.id);
                await localforage.setItem(GoodAlpacaStorageKey, this.state.badAlpaca);
                this.setState({
                    badAlpaca: this.state.badAlpaca
                });
                break;
        }

        if (_.isUndefined(alpaca.left))
            alpaca.left = 0;

        if (_.isUndefined(alpaca.top))
            alpaca.top = 0;

        this.setState((prevState, props) => {
            prevState.users[alpaca.id] = alpaca;
            return {
                users: prevState.users
            };
        }
        );
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
                <AlpacaFarm alpaca={this.state.users} alpacaDropped={this.alpacaDropped} moveAlpaca={this.moveAlpaca}/>
                <div className={`ms-Grid-row ${styles.footerRow}`}>
                    <div className="ms-Grid-col ms-u-sm4" ref={(e) => this._targetGoodAlpacaCalloutElement = e} onClick={() => this.setState((prevState, props) => ({ isGoodAlpacaCalloutVisible: !prevState.isGoodAlpacaCalloutVisible }))}>
                        # of Good Alpaca: {Object.keys(this.state.goodAlpaca).length}
                    </div>
                    <div className="ms-Grid-col ms-u-sm4" ref={(e) => this._targetBadAlpacaCalloutElement = e} onClick={() => this.setState((prevState, props) => ({ isBadAlpacaCalloutVisible: !prevState.isBadAlpacaCalloutVisible }))}>
                        # of Bad Alpaca: {Object.keys(this.state.badAlpaca).length}
                    </div>
                    <div className="ms-Grid-col ms-u-sm4">
                        <PrimaryButton
                            text='Refresh Alpacas'
                            onClick={this.refreshAlpacas}
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
