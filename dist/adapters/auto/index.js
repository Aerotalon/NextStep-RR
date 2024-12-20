'use client';
'use no memo';
import { useNextAdapter } from '../next';
import { useReactRouterAdapter } from '../react-router';
import { useWindowAdapter } from '../window';
export const useAutoAdapter = () => {
    const isClient = typeof window !== 'undefined';
    if (!isClient) {
        return {
            push: () => { },
            getCurrentPath: () => '/',
        };
    }
    if (window.__reactRouterVersion) {
        console.log('react-router-adapter found');
        console.log('react-router-adapter found');
        console.log('react-router-adapter found');
        console.log('react-router-adapter found');
        console.log('react-router-adapter found');
        return useReactRouterAdapter();
    }
    else if (window.__NEXT_DATA__) {
        console.log('next-adapter found');
        console.log('next-adapter found');
        console.log('next-adapter found');
        console.log('next-adapter found');
        console.log('next-adapter found');
        console.log('next-adapter found');
        return useNextAdapter();
    }
    else {
        return useWindowAdapter();
    }
};
