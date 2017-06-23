import { IWebPartContext } from '@microsoft/sp-webpart-base';
export interface IAlpacaManagementProps {
  description: string;
  farmSize: number;
  context: IWebPartContext;
}
