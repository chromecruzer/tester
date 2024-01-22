// under development //coming soon
import {InputDataTypeLabel, InputToSqlMapping} from "./datatypes";

export const employeeRecordDm:InputToSqlMapping[]=[           // check this part carefully

    {
        xlsxAddress: 'A',
        dataType: 'string',
        sqlLabel: 'emp_id',
        sqlType: 'varchar(10)',
      },
      {
        xlsxAddress: 'B',
        dataType: 'string',
        sqlLabel: 'emp_name',
        sqlType: 'varchar(50)',
      },
     
      {
        xlsxAddress: 'C',
        dataType: 'string',
        sqlLabel: 'emp_gender',
        sqlType: 'varchar(20)',
      }

]