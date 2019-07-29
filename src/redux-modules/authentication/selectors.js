import { NAMESPACE } from './constants';

const getLocalState = state => state[NAMESPACE];

export const getServiceUrl = state => getLocalState(state).serviceUrl;

export const getCode = state => getLocalState(state).code;
