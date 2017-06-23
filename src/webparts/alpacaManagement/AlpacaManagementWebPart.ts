import * as React from 'react';
import * as ReactDom from 'react-dom';
import "whatwg-fetch";
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';

import * as strings from 'alpacaManagementStrings';
import AlpacaManagement from './components/AlpacaManagement';
import { IAlpacaManagementProps } from './components/IAlpacaManagementProps';
import { IAlpacaManagementWebPartProps } from './IAlpacaManagementWebPartProps';

export default class AlpacaManagementWebPart extends BaseClientSideWebPart<IAlpacaManagementWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IAlpacaManagementProps> = React.createElement(
      AlpacaManagement,
      {
        description: this.properties.description,
        farmSize: this.properties.farmSize || 700,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneSlider('farmSize', {
                  min: 200,
                  max: 1000,
                  label: 'Farm Size'
                }),
                PropertyPaneTextField('groupName', {
                  label: 'Group Name'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
