import { useAppStateContext } from "../store/AppStateProvider";

export function useAppState() {
  return useAppStateContext();
}

