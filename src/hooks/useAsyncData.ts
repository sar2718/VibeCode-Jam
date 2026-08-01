import { DependencyList, useEffect, useState } from "react";

interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList = []
): AsyncDataState<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    setState({
      data: null,
      isLoading: true,
      error: null
    });

    loader()
      .then((data) => {
        if (!cancelled) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : "Unexpected error"
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
