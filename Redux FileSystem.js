This is for testing purpose. This code is not included the Project. It is a overview of Redux tollkit file system

store file
import { configureStore } from '@reduxjs/toolkit';
import productSlice from './features/products/productSlice';
import { api } from './api/apiSlice';
const store = configureStore({
  reducer: {
    product: productSlice,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
export default store;

api file
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['leads'],
  endpoints: () => ({}),
});

product api slice connect api
import { api } from '../../api/apiSlice';
const leadsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLeads: builder.query({
            query: () => '/fakeData/leads/leads.json',
            providesTags: ['leads'],
        }),
        postLeads: builder.mutation({
            query: (data) => ({
                url: '/postApi',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['leads'],
        }),
    }),
});
export const {
    useGetLeadsQuery,
    usePostLeadsMutation
} = leadsApi;

Product slice file
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    status: false,
    priceRange: 150,
};
const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        toggleState: (state) => {
            state.status = !state.status;
        },
        setPriceRange: (state, action) => {
            state.priceRange = action.payload;
        },
    },
});
export const { toggleState, setPriceRange } = productSlice.actions;
export default productSlice.reducer;

jsx file for get reducer value value
const { priceRange, status } = useSelector((state) => state.product);
const dispatch = useDispatch();

For post
const [postLeads, { isLoading, isError, isSuccess }] = usePostLeadsMutation();

For get
const { data: tableDatas, isLoading } = useGetLeadsQuery(undefined, { refetchOnMountOrArgChange: true, pollingInterval: 30000,});