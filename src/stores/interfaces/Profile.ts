export interface ProfileDetail {
    id:               string;
    lastName:         string;
    firstName:        string;
    middleName:       string;
    nickName:         string;
    email:            string;
    active:           boolean;
    verifyByJuristic: boolean;
    channel:          string;
    imageProfile:     string;
    contact:          string;
    createdAt:        Date;
    role:             string;
}
export interface editProfileDetail{
    contact : string
    imageProfile?:string
}