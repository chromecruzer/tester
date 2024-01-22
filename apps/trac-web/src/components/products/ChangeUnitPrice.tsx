import React, {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {DialogModal} from "../tables/DialogModal";
import {getProducts, postBatchPriceUpdate} from "../../api/productApi";

export const ChangeUnitPrice = ({batchEdit, open, currentPrice, requestClose}) => {
  const [price, setPrice] = useState(currentPrice);
  const queryClient = useQueryClient();
  const postBatchUnitPriceUpdateMutation = useMutation({
    mutationFn: async () => {
      return postBatchPriceUpdate(batchEdit.updatePrice(price));
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      queryClient.prefetchQuery(['audit'], () => getProducts());
    },
    onSettled: () => {
      handleClose();
    }
  })
  const handleClose = () => {
    requestClose();
  }
  const handleChange = e => {
         setPrice(e.target.value);
  }
  const handleSubmit = () => {
    postBatchUnitPriceUpdateMutation.mutate();
  }
  return <DialogModal open={open} requestClose={handleClose}>
    <div className='flex-col min-h-full min-w-full justify-items-stretch'>
      <h2 className='px-2 py-2 text-center font-bold text-bl-text-dark'>Price</h2>
      <input
        type='number'
        value={currentPrice}
        placeholder='new price'
        onChange={handleChange}
        className='border-2 px-2 py-2 grow justify-self-stretch self-stretch min-h-0 min-w-0 w-full h-full'
      />
      <div className='flex-row content-between'>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={handleClose}>Cancel</button>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={handleSubmit}>Ok</button>
      </div>
    </div>
  </DialogModal>
}
