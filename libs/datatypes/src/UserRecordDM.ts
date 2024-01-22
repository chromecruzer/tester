// under development //coming soon
import {InputDataTypeLabel, InputToSqlMapping} from "./datatypes";

export const userRecordDm:InputToSqlMapping[]=[           // check this part carefully

    {
        xlsxAddress: 'A',
        dataType: 'string',
        sqlLabel: 'username',
        sqlType: 'varchar(50)',
      },
      {
        xlsxAddress: 'B',
        dataType: 'string',
        sqlLabel: 'userpwd',
        sqlType: 'varchar(35)',
      }
]