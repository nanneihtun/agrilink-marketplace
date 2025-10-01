import { useState, useRef, useCallback } from 'react';

/**
 * Safe state hook that prevents setState during render cycles
 */
export function useSafeState<T>(initialValue: T | (() => T)) {
  const [state, setState] = useState(initialValue);
  const isUpdatingRef = useRef(false);
  const pendingUpdateRef = useRef<T | null>(null);

  const safeSetState = useCallback((value: T | ((prevState: T) => T)) => {
    // Prevent updates during render
    if (isUpdatingRef.current) {
      console.warn('Attempted setState during render, deferring update');
      
      // Store the pending update
      if (typeof value === 'function') {
        pendingUpdateRef.current = (value as (prevState: T) => T)(state);
      } else {
        pendingUpdateRef.current = value;
      }
      
      // Apply the pending update on next tick
      setTimeout(() => {
        if (pendingUpdateRef.current !== null) {
          setState(pendingUpdateRef.current);
          pendingUpdateRef.current = null;
        }
      }, 0);
      
      return;
    }

    // Normal update
    isUpdatingRef.current = true;
    setState(value);
    
    // Reset flag after update
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [state]);

  return [state, safeSetState] as const;
}

/**
 * Safe effect hook that prevents setState during render
 */
export function useSafeEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const renderingRef = useRef(false);
  
  React.useEffect(() => {
    if (renderingRef.current) {
      // Defer effect if called during render
      setTimeout(() => {
        renderingRef.current = false;
        const cleanup = effect();
        return cleanup;
      }, 0);
    } else {
      renderingRef.current = true;
      const cleanup = effect();
      renderingRef.current = false;
      return cleanup;
    }
  }, deps);
}