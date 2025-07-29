import { useRef, useCallback } from 'react';

export const useApiCall = () => {
    const isRequestingRef = useRef(false);

    const makeApiCall = useCallback(async (apiFunction, ...args) => {
        // If a request is already in progress, don't make another one
        if (isRequestingRef.current) {
            return;
        }

        isRequestingRef.current = true;
        
        try {
            const result = await apiFunction(...args);
            return result;
        } finally {
            isRequestingRef.current = false;
        }
    }, []);

    return makeApiCall;
}; 