export interface IAlpacaManagementState {
    loading?: boolean;
    me?: any;
    users?: object;
    goodAlpaca?: object;
    badAlpaca?: object;
    isBadAlpacaCalloutVisible?: boolean;
    isGoodAlpacaCalloutVisible?: boolean;
}