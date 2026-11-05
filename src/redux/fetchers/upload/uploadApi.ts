import { baseApi } from "../api/baseApi";

interface UploadImageResponse {
  data?: { imageUrl: string };
  message?: string;
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadImageResponse, FormData>({
      query: (body) => ({ url: "/upload/image", method: "POST", body }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
