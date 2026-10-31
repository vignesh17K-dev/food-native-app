import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type OrderDeliveryStatus =
  | "confirmed"
  | "prepared"
  | "out_for_delivery"
  | "delivered"
  | string;

export type OrderStatusEvent = {
  order_id: string;
  order_status: OrderDeliveryStatus;
  payment_status?: "created" | "paid" | "failed" | string;
  amount?: number;
  currency?: string;
  estimated_delivery_time?: string;
  [key: string]: unknown;
};

type OrderStatusState = {
  statusesByOrderId: Record<string, OrderStatusEvent>;
};

const initialState: OrderStatusState = {
  statusesByOrderId: {},
};

const OrderStatusSlice = createSlice({
  name: "orderStatus",
  initialState,
  reducers: {
    setOrderDeliveryStatus: (
      state,
      { payload }: PayloadAction<OrderStatusEvent>,
    ) => {
      state.statusesByOrderId[payload.order_id] = payload;
    },
    removeOrderDeliveryStatus: (
      state,
      { payload }: PayloadAction<string>,
    ) => {
      delete state.statusesByOrderId[payload];
    },
    clearOrderStatuses: (state) => {
      state.statusesByOrderId = {};
    },
  },
});

export const {
  setOrderDeliveryStatus,
  removeOrderDeliveryStatus,
  clearOrderStatuses,
} = OrderStatusSlice.actions;
export default OrderStatusSlice.reducer;
