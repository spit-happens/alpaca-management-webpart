import * as React from 'react';
import * as update from 'react/lib/update';
import AlpacaFarm from './AlpacaFarm';
import styles from './AlpacaManagement.module.scss';
import { IUserResponse, IUser, IUserStyle, UserHash } from './AlpacaTypes';
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
import * as XLSX from 'xlsx';

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
            me: null,
            users: {},
            goodAlpaca: {},
            badAlpaca: {},
            spaceLettuce: [],
            isGoodAlpacaCalloutVisible: false,
            isBadAlpacaCalloutVisible: false,
            alpacaPens: [
                {
                    title: "Good Alpaca",
                    left: 100,
                    top: 525,
                    dropColor: "green"
                },
                {
                    title: "Bad Alpaca",
                    left: 370,
                    top: 580,
                    dropColor: "red"
                }
            ]
        };
        Log.info("Alpaca Management", "Initialized");
    }

    public async componentDidMount() {
        this.getAlpacas();

        let randomSpaceLettuce = [];

        for (let i = 0; i < _.random(4, 10); i++) {
            randomSpaceLettuce.push({
                left: _.random(0, this.props.farmSize - 25),
                top: _.random(0, this.props.farmSize * .70),
                saturate: _.random(0.5, 2, true)
            });
        }

        this.setState({
            spaceLettuce: randomSpaceLettuce
        });
    }

    private getRandomStyle(): IUserStyle {
        return {
            left: _.random(0, this.props.farmSize - 25),
            top: _.random(0, this.props.farmSize * .70),
            scaleX: _.random(1, 2) == 2 ? -1 : 1,
            hueRotation: 0, //_.random(0, 360), -- this was too frilly.
            saturate: _.random(0.5, 2, true)
        };
    }

    @autobind
    public getAlpacaSpreadsheet() {
        const goodAlpacaWSName = "Good Alpaca";
        const badAlpacaWSName = "Bad Alpaca";

        let wb = { SheetNames: [], Sheets: {} };

        /* make worksheets */
        let goodAlpacaData = [];
        Object.keys(this.state.goodAlpaca).map((id) => {
            goodAlpacaData.push(this.state.goodAlpaca[id]);
        });
        let goodAlpacaWS = XLSX.utils.json_to_sheet(goodAlpacaData);
        wb.SheetNames.push(goodAlpacaWSName);
        wb.Sheets[goodAlpacaWSName] = goodAlpacaWS;

        let badAlpacaData = [];
        Object.keys(this.state.badAlpaca).map((id) => {
            badAlpacaData.push(this.state.badAlpaca[id]);
        });
        let badAlpacaWS = XLSX.utils.json_to_sheet(badAlpacaData);
        wb.SheetNames.push(badAlpacaWSName);
        wb.Sheets[badAlpacaWSName] = badAlpacaWS;

        let wbout = XLSX.write(wb, {
            bookType: 'xlsx',
            bookSST: true,
            type: 'binary'
        });

        let xlsxBlob = new Blob([this.str2ab(wbout)], { type: "application/octet-stream" });
        this.saveAs(xlsxBlob, "alpaca.xlsx");
    }

    private str2ab(str) {
        if (typeof ArrayBuffer !== 'undefined') {
            let buf = new ArrayBuffer(str.length);
            let view = new Uint8Array(buf);
            for (let i = 0; i != str.length; ++i) view[i] = str.charCodeAt(i) & 0xFF;
            return buf;
        } else {
            let buf = new Array(str.length);
            for (let i = 0; i != str.length; ++i) buf[i] = str.charCodeAt(i) & 0xFF;
            return buf;
        }
    }

    private saveAs(blob, filename) {
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(blob, filename);
        }
        else {
            var blobURL = window.URL.createObjectURL(blob);
            var tempLink = document.createElement('a');
            tempLink.style.display = 'none';
            tempLink.href = blobURL;
            tempLink.setAttribute('download', filename);
            tempLink.setAttribute('target', '_blank');
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
        }
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

        if (!accessTokenObj) {
            accessTokenObj = {};
        }

        let accessToken = currentHashParts.query(true)['access_token'] || accessTokenObj.accessToken;
        let client = GraphClient.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });

        let meResult: IUser, usersResult: IUserResponse;
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

        let mappedUsers = _.zipObject(_.map(filteredUsers, "id"), filteredUsers) as UserHash;

        let storedGoodAlpaca = await localforage.getItem(GoodAlpacaStorageKey) as UserHash;
        let storedBadAlpaca = await localforage.getItem(BadAlpacaStorageKey) as UserHash;

        let goodAlpaca: UserHash = {}, badAlpaca: UserHash = {};
        Object.keys(mappedUsers).map((userId) => {
            if (storedGoodAlpaca && storedGoodAlpaca[userId]) {
                let ga = storedGoodAlpaca[userId];
                //This lets us pick up any changes to the user (email, name change, so on) but still maintain the previous position/style.
                goodAlpaca[userId] = { ...mappedUsers[userId], style: ga.style || this.getRandomStyle() };
                _.unset(mappedUsers, userId);
            } else if (storedBadAlpaca && storedBadAlpaca[userId]) {
                let ga = storedBadAlpaca[userId];
                badAlpaca[userId] = { ...mappedUsers[userId], style: ga.style || this.getRandomStyle() };
                _.unset(mappedUsers, userId);
            }
        });

        Object.keys(mappedUsers).forEach(id => {
            let alpaca = mappedUsers[id];
            alpaca.style = this.getRandomStyle();
        });

        this.setState({
            loading: false,
            me: meResult,
            users: mappedUsers,
            goodAlpaca: goodAlpaca,
            badAlpaca: badAlpaca
        });
    }

    @autobind
    private alpacaClicked(id: string) {
        this.setState((prevState, props) => {
            const alpaca = prevState.users[id];
            if (!alpaca) {
                return;
            }
            alpaca.isCalloutVisible = !alpaca.isCalloutVisible;

            return {
                users: prevState.users
            };
        });
    }

    @autobind
    private alpacaCalloutDismissed(id: string) {
        this.setState((prevState, props) => {
            const alpaca = prevState.users[id];
            if (!alpaca) {
                return;
            }
            alpaca.isCalloutVisible = false;
            return {
                users: prevState.users
            };
        });
    }

    @autobind
    private alpacaMoved(id: string, left: number, top: number): void {
        if (!this.state.users[id]) {
            return;
        }

        this.setState((prevState, props) => {
            let alpaca = prevState.users[id];
            alpaca.style.left = left;
            alpaca.style.top = top;
            return {
                users: prevState.users
            };
        });
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

        wanderingAlpaca.isCalloutVisible = false;
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
                <AlpacaFarm
                    farmSize={this.props.farmSize}
                    alpaca={this.state.users}
                    spaceLettuce={this.state.spaceLettuce}
                    alpacaPens={this.state.alpacaPens}
                    alpacaClicked={this.alpacaClicked}
                    alpacaMoved={this.alpacaMoved}
                    alpacaDropped={this.alpacaDropped}
                    alpacaCalloutDismissed={this.alpacaCalloutDismissed}
                />
                <div className={`ms-Grid-row ${styles.footerRow}`}>
                    <div className="ms-Grid-col ms-u-sm3" ref={(e) => this._targetGoodAlpacaCalloutElement = e} onClick={() => this.setState((prevState, props) => ({ isGoodAlpacaCalloutVisible: !prevState.isGoodAlpacaCalloutVisible }))}>
                        # of Good Alpaca: {Object.keys(this.state.goodAlpaca).length}
                    </div>
                    <div className="ms-Grid-col ms-u-sm3" ref={(e) => this._targetBadAlpacaCalloutElement = e} onClick={() => this.setState((prevState, props) => ({ isBadAlpacaCalloutVisible: !prevState.isBadAlpacaCalloutVisible }))}>
                        # of Bad Alpaca: {Object.keys(this.state.badAlpaca).length}
                    </div>
                    <div className="ms-Grid-col ms-u-sm3">
                        <PrimaryButton
                            text='Get Alpaca Spreadsheet'
                            onClick={this.getAlpacaSpreadsheet}
                            iconProps={{ iconName: 'ExcelLogo' }}
                            style={{ float: "right" }}
                        />
                    </div>
                    <div className="ms-Grid-col ms-u-sm3">
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
                                    const currentAlpaca = goodAlpaca[id];
                                    const style = currentAlpaca.style;
                                    return (
                                        <div key={currentAlpaca.id}
                                            title={currentAlpaca.displayName}
                                            onClick={() => this.putBackAlpaca(currentAlpaca, "Good Alpaca")}
                                            className={styles.alpaca}
                                            style={{ float: "left", cursor: "pointer", position: "relative", transform: `scaleX(${style.scaleX})`, filter: `hue-rotate(${style.hueRotation}deg) saturate(${style.saturate})` }}
                                        />
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
                                    const currentAlpaca = badAlpaca[id];
                                    const style = currentAlpaca.style;
                                    return (
                                        <div key={currentAlpaca.id}
                                            title={currentAlpaca.displayName}
                                            onClick={() => this.putBackAlpaca(currentAlpaca, "Bad Alpaca")}
                                            className={styles.alpaca}
                                            style={{ float: "left", cursor: "pointer", position: "relative", transform: `scaleX(${style.scaleX})`, filter: `hue-rotate(${style.hueRotation}deg) saturate(${style.saturate})` }}
                                        />
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
