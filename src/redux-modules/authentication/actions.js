import * as actionTypes from './action-types';

export const setServiceUrl = serviceUrl => ({
  type: actionTypes.SET_SERVICE_URL,
  payload: serviceUrl,
});

export const setCode = code => ({
  type: actionTypes.SET_CODE,
  payload: code,
});
