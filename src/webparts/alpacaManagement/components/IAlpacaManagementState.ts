import { IUser, UserHash } from './AlpacaTypes'

export interface IAlpacaManagementState {
    loading?: boolean;
    me?: IUser;
    users?: UserHash
    goodAlpaca?: UserHash;
    badAlpaca?: UserHash;
    spaceLettuce?: Array<any>;
    isBadAlpacaCalloutVisible?: boolean;
    isGoodAlpacaCalloutVisible?: boolean;
    alpacaPens?: Array<any>;
}