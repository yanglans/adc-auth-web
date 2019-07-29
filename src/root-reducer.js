import { combineReducers } from 'redux';
import * as authentication from './redux-modules/authentication';

const rootReducer = combineReducers({
  [authentication.NAMESPACE]: authentication.reducer,
});

export default rootReducer;
