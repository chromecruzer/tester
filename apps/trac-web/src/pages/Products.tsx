import React, {useMemo, useState} from "react";
import {condensedProductTableColumns} from "@trac/datatypes";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getProducts, postBatchExcludeUpdate} from "../api/productApi";
import {TracTable} from "../components/tables/TracTable";
import _ from "lodash";
import {DownloadButton} from "../components/tables/DownloadButton";
import BatchProductEdit from "../components/products/BatchProductEdit";
import {ChangeUnitPrice} from "../components/products/ChangeUnitPrice";
import {ProductContextMenu} from "../components/products/ProductContextMenu";

const batchEdit = new BatchProductEdit();

const tableFormatter = p => ({
  ...p,
  description4: `${p.product_id_level4} ${p.description_level4}`,
  description5: `${p.product_id_level5 || ''} ${p.description_level5}`,
  details: `${p.product_id_level2 || ''} ${p.description_level2 || ''} ${p.product_id_level3 || ''} ${p.description_level3 || ''}`,
  excluded: (p.excluded ? 'EXCLUDED' : '')
});

export const Products = () => {
  const [changePriceIsOpen, setChangePriceIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const postBatchSetExcludeMutation = useMutation({
    mutationFn: async exclude => {
      return postBatchExcludeUpdate(batchEdit.updateExclude(exclude));
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  })
  const {
    isLoading,
    error,
    data
  } = useQuery({
      queryKey: ['products'],
      queryFn: () => getProducts(),
      select: data => _.map(data, d => tableFormatter(d)) || [],
    });
  const handleSingleClick = uuids => {
    batchEdit.setSelectedUuids(uuids);
  }
  const errorMessage = error && <div><h4>Network Error</h4></div>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>
  const sendExclude = exclude => {
    postBatchSetExcludeMutation.mutate(exclude);
  }

  return <>
    <ChangeUnitPrice
    batchEdit={batchEdit}
    open={changePriceIsOpen}
    currentPrice={undefined}
    requestClose={() => setChangePriceIsOpen(false)}/>
    {!_.isEmpty(data) &&
      <ProductContextMenu changePriceAction={() => setChangePriceIsOpen(true)} setExclude={sendExclude}>
        <TracTable
          columns={condensedProductTableColumns}
          data={data}
          needGlobalFilter={true}
          singleClickAction={handleSingleClick}
          isMultiSelect={true}
        >
          <DownloadButton headers={condensedProductTableColumns}
                          data={data}
                          downloadType='spreadsheet'
          />
        </TracTable>
      </ProductContextMenu>}
    {errorMessage}
    {loadingMessage}
  </>
};
