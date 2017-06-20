import * as React from 'react';
import styles from './AlpacaManagement.module.scss';
import { IAlpacaManagementProps } from './IAlpacaManagementProps';
import { IAlpacaManagementState } from './IAlpacaManagementState';
import { escape } from '@microsoft/sp-lodash-subset';
import { Log } from '@microsoft/sp-core-library';
import { PrimaryButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Client as GraphClient } from '@microsoft/microsoft-graph-client';
import * as URI from 'urijs';

export default class AlpacaManagement extends React.Component<IAlpacaManagementProps, IAlpacaManagementState> {
  public constructor(props) {
    super(props);

    this.state = {
      loading: false,
      me: [],
      users: []
    }

    Log.info("Alpaca Management", "Initializing");
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

    if (!currentHashParts.hasQuery("access_token")) {
      window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?\
client_id=${clientId}\
&response_type=token\
&redirect_uri=${currentUri.search('').fragment('').href()}\
&scope=${desiredScope.join('%20')}`;
    }

    //TODO: Store the access token and other info in state.

    let accessToken = currentHashParts.query(true)['access_token'];
    let client = GraphClient.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    let meResult = await client.api('/me')
      .get();

    let usersResult = await client.api('/users')
      .top(500)
      .get();

    this.setState({
      loading: false,
      me: meResult,
      users: usersResult
    });
  }

  public render(): React.ReactElement<IAlpacaManagementProps> {
    return (
      <div className={styles.alpacaManagement}>
        <div className={styles.container}>
          <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`}>
            <div className="ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1">
              <span className="ms-font-xl ms-fontColor-white">Welcome to SharePoint!</span>
              <p className="ms-font-l ms-fontColor-white">Customize SharePoint experiences using Web Parts.</p>
              <p className="ms-font-l ms-fontColor-white">{escape(this.props.description)}</p>
              <PrimaryButton
                text='Get Stuffs'
                onClick={this.getAlpacas}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
