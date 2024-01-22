import * as React from 'react';
import {useEffect, useMemo, useState} from "react";
import {
  customerContactTableColumns,
  CustomerRecord,
  customerTableColumns,
  salesMappingsTableColumns
} from "@trac/datatypes";
import {getCustomerContacts, getCustomers, getSalesMappings} from "../api/customerApi";
import {useQuery} from "@tanstack/react-query";
import _ from "lodash";
import {TracTable} from "../components/tables/TracTable";
import {ColumnSpecifications} from "../components/tables/TableOps";
import {getMissingEmails} from "../api/emailApi";
const prependColumn = {
  header: 'Name',
  accessor: 'name',
};

const queryCustomers =  {
  queryKey: ['customers'],
  queryFn: () => getCustomers({}),
  select: data => {
    return _.reduce(data as CustomerRecord[], (accum, c) => {
      accum[c.customer_code] = c;
      return accum;
    }, {});
  },
};
const queryCustomerContacts =  {
  queryKey: ['customer contact'],
  queryFn: () => getCustomerContacts({}),
  select: data => {
    return data;
  },
};
const querySalesMappings =  {
  queryKey: ['sales mappings'],
  queryFn: () => getSalesMappings({}),
  select: data => {
    return data;
  },
};

const queryMissingEmails =  {
  queryKey: ['missingEmails'],
  queryFn: () => getMissingEmails(),
  select: data => {
    return data;
  },
};

const Customers = () => {
  const columnTypes = ['Customers', 'Contacts', 'Sales Mappings'];
  const [columnType, setColumnType] = useState('Customers');
  const [columns, setColumns] = useState([] as ColumnSpecifications[]);
  const [displayData, setDisplayData] = useState([] as any[]);
  const {data: customers} = useQuery(queryCustomers);
  const {data: contacts} = useQuery(queryCustomerContacts);
  const {data: salesMappings} = useQuery(querySalesMappings);
  const {data: missingEmails} = useQuery(queryMissingEmails);

  const columnsFn = () => {
    switch (columnType) {
      case 'Customers':
        return customerTableColumns;
      case 'Contacts':
        return [prependColumn, ...customerContactTableColumns];
      case 'Sales Mappings':
        return [prependColumn, ...salesMappingsTableColumns];
    }
    return [];
  };
  const displayQueryFn = () => {
    if(customers && contacts && salesMappings) {
      switch (columnType) {
        case 'Customers':
          return _.values(customers);
        case 'Contacts':
          return _.map(contacts, ct => {
            const name = customers[ct.ship_to_id] ? (customers[ct.ship_to_id] as CustomerRecord).name : '';
            return {...ct, name}
          });
        case 'Sales Mappings':
          return _.map(salesMappings, sm => {
            const name = customers[sm.customer_ship_to] ? (customers[sm.customer_ship_to] as CustomerRecord).name : '';
            return {...sm, name}
          });
      }
    }
    return [];
  }
useEffect(() => {
  setColumns(columnsFn());
  setDisplayData(displayQueryFn());
}, [columnType, customers, salesMappings, contacts]);
  const prefix = 'border-2 px-2 py-2 ';
  const active = 'filter-button-active';
  const inactive = 'filter-button-inactive';
  console.log(`button styles ${prefix}, ${active} ${inactive}`)
  console.log(`columnType ${columnType} customers`,customers)
  console.log(`columnType ${columnType} contacts`,contacts)
  console.log(`columnType ${columnType} sales mappings`,salesMappings)
  console.log(`columnType ${columnType} missing emails`, missingEmails)
  const switchColumnType = type => {
    setColumnType(type);
  }
  return <TracTable columns={columns} data={displayData}>
    {_.map(columnTypes, c => <button onClick={() => switchColumnType(c)}
                                     key={c}
                                     className={`${c === columnType ? active : inactive} ${prefix}`}>{c}</button>)}
  </TracTable>

}
export default Customers;
