import React, {useState} from 'react';
import * as _ from 'lodash';
import {MdOutlineRefresh} from "react-icons/md";
import {formatTracDate, notifyPaths, NullableString} from "@trac/datatypes";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getUploadHistory} from "../../api/uploadApi";
import {TracTable} from "../tables/TracTable";
import {useTracContext} from "../../TracContext";
import {postDataRefresh} from "../../api/refreshApi";
import {createUuid} from "../../api/formatters";
import {UploadStatus} from "./UploadStatus";
import useWebSocket from "react-use-websocket";
import {wsRoot} from "../../httpConfig";

const uploadSupportedFileLabels = {
  all: 'All Data',
  'iol_report': 'IOL Report',
  'customer_data': 'Customer Data',
  'customer_contact_data': 'Customer Contacts',
  'product_data': 'Product Data',
  'sales_mapping_data': 'Sales Rep Mapping Data',
  'sales_rep_data': 'Sales Rep Data',
  'refresh_data': 'Data Set Was Refreshed',
};
const historyTableColumns = [
  {
    header: 'File Type',
    accessor: 'type',
  },
  {
    header: 'Uploaded By',
    accessor: 'user',
  },
  {
    header: 'Uploaded On',
    accessor: 'date',
  },
]
export const DataUploadHistory = () => {
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  const {getTracContext} = useTracContext();
  const user = getTracContext('appUser');
  const {readyState, lastMessage} = useWebSocket(`${wsRoot}${notifyPaths['iolUpload']}`,
    {share: true, retryOnError: true});
  const queryClient = useQueryClient();
  const historyFormatter =  (history) => {
    // console.log('formatting history', history);
    return _.map(history,
      h => {
        return {
          ...h,
          type: uploadSupportedFileLabels[h.type],
          date: formatTracDate(h.date),
          uuid: createUuid(),
        }
      })
  };
  const postRefreshMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postDataRefresh(user);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries();
    },
    onError: (error:NullableString) => {
      if(error) {
        setError(error);
        console.error('post audit notes',error);
      }
    },
    onSettled: () => {
      setIsLoading(false);
      queryClient.removeQueries({queryKey:['data history']})
    }

  });
  const queryOptions =  {
      queryKey: ['data history'],
      queryFn: () => getUploadHistory(),
      select: data => {
        return historyFormatter(data);
      },
    };
  const {data} = useQuery(queryOptions);
  const click = () => {
    postRefreshMutation.mutate()
  }
  const loadingMessage = isLoading && <UploadStatus
    readyStatus={readyState}
    message={lastMessage}/>

  return <TracTable
      columns={historyTableColumns}
      data={data}
      getRowIdFn={r => r.name}
      addCellPropsFn={() => 'px-2'}
    >
    <button disabled={isLoading}
            className={`${isLoading ? 'button-disabled' : 'button-enabled'} button`}
            onClick={click}><MdOutlineRefresh/>Update Data Set</button>
    {loadingMessage}
    </TracTable>
}
