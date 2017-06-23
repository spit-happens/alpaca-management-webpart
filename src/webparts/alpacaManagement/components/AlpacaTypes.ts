export interface IUserResponse {
    "@odata.context": string,
    value: Array<IUser>
}

export interface IUserStyle {
    left: number
    top: number
    scaleX: number
    hueRotation: number
    saturate: number
}

export interface IUser {
    "@odata.context": string,
    businessPhones: Array<string>,
    displayName: string,
    givenName: string,
    id: string,
    jobTitle: string,
    mail: string,
    mobilePhone: string,
    officeLocation: string,
    preferredLanguage: string,
    surname: string,
    userPrincipalName: string
    style?: IUserStyle
}

export type UserHash = { [id: string]: IUser }