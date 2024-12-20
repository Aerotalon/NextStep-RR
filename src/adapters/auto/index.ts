'use client';
'use no memo';
import { useState } from 'react';
import { NavigationAdapter } from '../../types/navigation';
import { useNextAdapter } from '../next';
import { useReactRouterAdapter } from '../react-router';
import { useWindowAdapter } from '../window';
const ReactRouterAdapter = () => useReactRouterAdapter();
const NextAdapter = () => useNextAdapter();
const WindowAdapter = () => useWindowAdapter();
const SSRFallbackAdapter = () => ({ push: () => {}, getCurrentPath: () => '/' });
export const useAutoAdapter = (): NavigationAdapter => {
 const [adapterType] = useState(() => {
   console.log('NextStep: Initial adapter selection');
   const isClient = typeof window !== 'undefined';
   if (!isClient) return 'none';
   
   if(window.__reactRouterVersion) return 'react-router';
   if(window.__NEXT_DATA__) return 'next';
   return 'window';
 });

 console.log('NextStep: Adapter type:', adapterType);
  switch (adapterType) {
   case 'react-router':
     return ReactRouterAdapter();
   case 'next':
     return NextAdapter();
   case 'window':
     return WindowAdapter();
   default:
     return SSRFallbackAdapter();
 }
}