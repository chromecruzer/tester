import {SignatureFields} from "./SearchSignature";
import {removeTrailingSpace, spaceNull} from "./datatypes";

export const userTableColumns = [
  {
    header: 'UserName',
    accessor: 'username',
  },
  {
    header: 'Password',
    accessor: 'userpwd',
  },
];

export interface UserSignature {
  username: string;
  userpwd: string;
}

export const initialUserSignature = {
  uuid: null,
  username: null,
  userpwd: null,
}

export interface UserRecord {
  uuid: string;
  username: string;
  userpwd: string;
}

export const initialUserRecord = {
  uuid: null,
  username: null,
  userpwd: null,
}

export const userRecordFromArray = (array: (string | number | Date)[]) => {
  const result: (string | number | Date)[] = array;
  return <UserRecord>{
    username: removeTrailingSpace(result[0]),
    userpwd: result[1],
  }
}

export const addNewUser = (user): UserRecord => {
  const result = {...user};
  // console.log(`New user ${dump(result)}`)
  return result;
}

export const userTextSearchFields: SignatureFields = {
  searchFields: [
    'username',
  ],
  type: 'users',
  idFieldFn: () => "username"
};

export const matchUserFields = (a,b) => {
  return a.username === b.username &&
    a.userpwd === b.userpwd;
}

