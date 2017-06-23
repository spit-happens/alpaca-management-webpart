export interface IAlpacaManagementState {
    loading?: boolean;
    me?: any;
    users?: object;
    goodAlpaca?: object;
    badAlpaca?: object;
    spaceLettuce?: Array<any>;
    isBadAlpacaCalloutVisible?: boolean;
    isGoodAlpacaCalloutVisible?: boolean;
}