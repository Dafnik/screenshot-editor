import type {AppState} from '@/features/editor/state/app-state';
import type {AppEvent} from '@/features/editor/state/events';

// Library session state currently lives outside the editor store.
// This reducer intentionally acts as a passthrough until that state is colocated.
export function libraryReducer(state: AppState, _event: AppEvent): AppState {
  return state;
}
