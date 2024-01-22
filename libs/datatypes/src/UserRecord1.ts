import { SignatureFields } from "./SearchSignature";
//import { removeTrailingSpace, spaceNull } from "./datatypes";

export const userTableColumns = [
  {
    header: 'username',
    accessor: 'username',
  },
  {
    header: 'userpwd',
    accessor: 'userpwd',
  },
];

export interface UserSignature {

  username: string,

}


export interface UserRecord {
  uuid: string;
  username: string;
  userpwd: string;
}


export const UserTextSearchFields: SignatureFields = {
    searchFields: [
      'username',
      'userpwd'
    ],
    type: 'users',
    idFieldFn: () => 'username'
  };


  // must need to code for matching feilds funtions here ///////////////

  export const matchUser1Fields = (a,b) => {
    return a.username === b.username
      
  }