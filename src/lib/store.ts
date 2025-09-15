import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "@/components/storage";
import productsReducer from "./features/products/productsSlice";
import cartsReducer from "./features/carts/cartsSlice";
import { shippingAddressReducer } from "./features/shipping-address";
import { authReducer } from "./features/auth";
import { ordersReducer } from "./features/orders";
import { couponsReducer } from "./features/coupons";
import { reportsReducer } from "./features/reports";
import { attributesReducer } from "./features/attributes";
import { apiSlice } from "./features/api/apiSlice";

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["carts"],
};

const rootReducer = combineReducers({
  products: productsReducer,
  carts: cartsReducer,
  shippingAddress: shippingAddressReducer,
  auth: authReducer,
  orders: ordersReducer,
  coupons: couponsReducer,
  reports: reportsReducer,
  attributes: attributesReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(apiSlice.middleware),
  });

  const persistor = persistStore(store);
  return { store, persistor };
};

const store = makeStore().store;

// Infer the type of the store
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
