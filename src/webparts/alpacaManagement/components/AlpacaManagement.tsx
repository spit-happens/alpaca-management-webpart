import * as React from 'react';
import AlpacaFarm from './AlpacaFarm';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaManagementProps } from './IAlpacaManagementProps';
import { IAlpacaManagementState } from './IAlpacaManagementState';
import { escape } from '@microsoft/sp-lodash-subset';
import { Log } from '@microsoft/sp-core-library';
import { PrimaryButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Client as GraphClient } from '@microsoft/microsoft-graph-client';
import * as URI from 'urijs';

export default class AlpacaManagement extends React.Component<IAlpacaManagementProps, IAlpacaManagementState> {
    public constructor(props) {
        super(props);

        this.state = {
            loading: false,
            me: [],
            users: []
        };

        this.getAlpacas = this.getAlpacas.bind(this);
        Log.info("Alpaca Management", "Initialized");
    }

    public async componentDidMount() {
        this.getAlpacas();
    }

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

            this.setState({
                loading: false,
                me: meResult.value,
                users: usersResult.value
            });
        }
        catch (ex) {
          //An error occurred, redirect to the auth endpoint.
          window.location.href = authEndpointUri;
        }

    }

    public render(): React.ReactElement<IAlpacaManagementProps> {
        if (this.state.loading) {
            return (
                <Spinner size={SpinnerSize.large} label='Loading Alpacas...' />
            );
        }
        return (
            <div className={styles.alpacaManagement}>
                <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.headerRow}`}>
                    <div className="ms-Grid-col ms-u-sm12">
                        <span className="ms-font-xl ms-fontColor-white">{escape(this.props.description)}</span>
                    </div>
                </div>
                <AlpacaFarm alpaca={this.state.users} />
                <div className={`ms-Grid-row ${styles.footerRow}`}>
                    <div className="ms-Grid-col ms-u-sm8">
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
            </div>
        );
    }
}
