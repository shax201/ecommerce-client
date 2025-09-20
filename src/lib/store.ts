import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import storage from "@/components/storage";
import productsReducer from "./features/products/productsSlice";
import cartsReducer from "./features/carts/cartsSlice";
import { shippingAddressReducer } from "./features/shipping-address";
import { authReducer } from "./features/auth";
import { ordersReducer } from "./features/orders";
import { couponsReducer } from "./features/coupons";
import { reportsReducer } from "./features/reports";
import { attributesReducer } from "./features/attributes";
import { permissionReducer } from "./features/permissions";
import { userManagementReducer } from "./features/user-management";
import { logosReducer } from "./features/logos";
import { heroSectionsReducer } from "./features/hero-sections";
import { userSettingsReducer } from "./features/user-settings";
import { dynamicMenusReducer } from "./features/dynamic-menus";
import { clientLogosReducer } from "./features/client-logos";
import { clientReducer } from "./features/clients";
import { courierReducer } from "./features/courier";
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
  permissions: permissionReducer,
  userManagement: userManagementReducer,
  logos: logosReducer,
  heroSections: heroSectionsReducer,
  userSettings: userSettingsReducer,
  dynamicMenus: dynamicMenusReducer,
  clientLogos: clientLogosReducer,
  clients: clientReducer,
  courier: courierReducer,
  [apiSlice.reducerPath]: apiSlice.reducer
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        serializableCheck: false,
      });
      return middleware.concat(apiSlice.middleware);
    },
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

// Create typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { store };
