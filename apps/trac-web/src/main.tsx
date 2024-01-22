import * as React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import * as ReactDOM from 'react-dom/client';
import {App} from './App';
import './styles/tailwind.css';
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const queryClient = new QueryClient()
export const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
console.log("Testing 123");
root.render(
  <QueryClientProvider client={queryClient}>
    <App/>
    <ReactQueryDevtools initialIsOpen/>
  </QueryClientProvider>
);
