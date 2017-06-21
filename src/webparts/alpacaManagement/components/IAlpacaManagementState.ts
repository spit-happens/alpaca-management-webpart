export interface IAlpacaManagementState {
    loading?: boolean;
    me?: any;
    users?: any;
    goodAlpaca?: Array<any>;
    badAlpaca?: Array<any>;
    isBadAlpacaCalloutVisible?: boolean;
    isGoodAlpacaCalloutVisible?: boolean;
}