import { useSyncExternalStore } from 'react';
import type { StoreApiWithImmer } from './immer';

export function useStore<T, U>(
  store: StoreApiWithImmer<T>,
  selector: (state: T) => U,
): U {
  return useSyncExternalStore(
    (listener) =>
      store.subscribe(() => {
        listener();
      }),
    () => selector(store.getState()),
  );
}
