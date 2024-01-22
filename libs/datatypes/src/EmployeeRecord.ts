import {SignatureFields} from "./SearchSignature";
import _ from "lodash";

 export const EmployeeTableColoumns=[
    {
        header: 'Emp ID',
        accessor: 'emp_id',
      },
      {
        header: 'Emp Name',
        accessor: 'emp_name',
      },
      {
        header: 'Emp Gender',
        accessor: 'emp_gender',
      }
]

export interface EmployeeSignature {
    emp_id: string;
  }

  export interface EmployeeRecord {
    uuid: string;
    emp_id: string;
    emp_name: string;
    emp_gender: string;
    
  }

  export const employeeTextSearchFields: SignatureFields = {
    searchFields: [
      'emp_id',
      'emp_name',
      'emp_gender'
    ],
    type: 'employee',
    idFieldFn: () => 'emp_id'
  };


  // must need to code for matching feilds funtions here ///////////////  matchEmployeeFields

  export const matchEmployeeFields = (a,b) => {
    return a.emp_id === b.emp_id
      
  }