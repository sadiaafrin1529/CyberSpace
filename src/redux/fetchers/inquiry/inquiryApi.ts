import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  message?: string | null;
  status: string;
  createdAt: string;
  product?: { id: string; translations?: { lang: string; name: string }[] } | null;
  bundle?: { id: number; translations?: { lang: string; title: string }[] } | null;
  submittedBy?: { id: number; name?: string; email: string } | null;
}

/** Exactly one of productId / bundleId. */
interface SubmitInquiryPayload {
  productId?: string;
  bundleId?: number;
  name: string;
  phone: string;
  message?: string;
}

export const inquiryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitInquiry: builder.mutation<{ success: boolean }, SubmitInquiryPayload>({
      query: (body) => ({ url: "/inquiries", method: "POST", body }),
      invalidatesTags: [tagTypes.inquiry],
    }),
    getInquiries: builder.query<Inquiry[], void>({
      query: () => "/inquiries",
      providesTags: [tagTypes.inquiry],
      transformResponse: (res: { data?: Inquiry[] }) => res.data ?? [],
    }),
    getUserInquiries: builder.query<Inquiry[], void>({
      query: () => "/user/inquiries",
      providesTags: [tagTypes.inquiry],
      transformResponse: (res: { data?: Inquiry[] }) => res.data ?? [],
    }),
    updateInquiry: builder.mutation<{ success: boolean }, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/inquiries/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [tagTypes.inquiry],
    }),
  }),
});

export const {
  useSubmitInquiryMutation,
  useGetInquiriesQuery,
  useGetUserInquiriesQuery,
  useUpdateInquiryMutation,
} = inquiryApi;

/** Display name of what an inquiry is about: the product name, or the Solutions bundle title. */
export function inquiryTargetName(
  inq: Pick<Inquiry, "product" | "bundle">,
  lang: string,
): string {
  const L = lang.toUpperCase();
  const product = inq.product?.translations;
  if (product?.length) {
    return (product.find((x) => x.lang === L) ?? product.find((x) => x.lang === "EN") ?? product[0]).name;
  }
  const bundle = inq.bundle?.translations;
  if (bundle?.length) {
    return (bundle.find((x) => x.lang === L) ?? bundle.find((x) => x.lang === "EN") ?? bundle[0]).title;
  }
  return "—";
}
