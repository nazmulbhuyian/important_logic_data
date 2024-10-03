import axiosBaseQuery from "@/helpers/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { tagTypesList } from "../tagTypes";
import { BASE_URL } from "@/utils/constant";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  endpoints: () => ({}),
  tagTypes: tagTypesList,
});
