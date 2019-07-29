import * as actionTypes from './action-types';

const initialState = {
  serviceUrl: '',
  code: null,
};

export default function authenticationReducer(state = initialState, { type, payload }) {
  switch (type) {
    case actionTypes.SET_SERVICE_URL:
      return {
        ...state,
        serviceUrl: payload,
      };
    case actionTypes.SET_CODE:
      return {
        ...state,
        code: payload,
      };
    default:
      return state;
  }
}
