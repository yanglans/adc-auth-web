import { applyMiddleware, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './root-reducer';

export default function configureStore(preloadedState) {
  const sagaMiddleware = createSagaMiddleware();

  const middlewares = [thunkMiddleware, sagaMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);
  const enhancers = [middlewareEnhancer];

  let composedEnhancers = composeWithDevTools(...enhancers);

  if (process.env.NODE_ENV === 'production') {
    composedEnhancers = compose(...enhancers);
  }

  const store = createStore(rootReducer, preloadedState, composedEnhancers);

  return {
    ...store,
    runSaga: sagaMiddleware.run,
  };
}
