import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** A Solutions bundle the visitor is asking about (the same inquiry flow as products). */
export interface BundleInquiryTarget {
  id: number;
  title: string;
  /** Pre-filled message, e.g. for the "Order" button. */
  message?: string;
}

interface InquiryState {
  modalProductId: string | null;
  modalBundle: BundleInquiryTarget | null;
}

const inquirySlice = createSlice({
  name: "inquiry",
  initialState: { modalProductId: null, modalBundle: null } as InquiryState,
  reducers: {
    openInquiry(state, action: PayloadAction<string>) {
      state.modalProductId = action.payload;
      state.modalBundle = null;
    },
    openBundleInquiry(state, action: PayloadAction<BundleInquiryTarget>) {
      state.modalBundle = action.payload;
      state.modalProductId = null;
    },
    closeInquiry(state) {
      state.modalProductId = null;
      state.modalBundle = null;
    },
  },
});

export const { openInquiry, openBundleInquiry, closeInquiry } = inquirySlice.actions;
export default inquirySlice.reducer;
