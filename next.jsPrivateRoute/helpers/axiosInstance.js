import setAccessToken from "@/actions/setAccessToken";
import { storeUserInfo, getNewAccessToken } from "@/utils/auth";
import { AUTH_TOKEN_KEY } from "@/utils/constant";
import { getFromLocalStorage } from "@/utils/localStorage";
import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.defaults.headers.post["Content-Type"] = "application/json";
axiosInstance.defaults.headers["Accept"] = "application/json";
axiosInstance.defaults.timeout = 100000;

// Add a request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    const token = getFromLocalStorage(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    // Successful response handling
    const responseObj = {
      data: response?.data?.data,
      meta: response?.data?.meta,
    };
    return responseObj;
  },
  async function (error) {
    const config = error.config;

    // Token expired error handling
    if (
      error?.response?.data?.error?.name === "TokenExpiredError" ||
      "jwt expired"
    ) {
      try {
        // Attempt to get a new access token
        const response = await getNewAccessToken();
        const newToken = response?.data?.accessToken;

        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
          storeUserInfo(newToken); // Update stored user token
          setAccessToken(newToken); // Set new access token in the system

          // Retry the original request with the new token
          return axiosInstance(config);
        }
      } catch (tokenRefreshError) {
        // Handle any errors during token refresh
        return Promise.reject(tokenRefreshError);
      }
    }
    // General error handling if it's not a token expiration issue
    const errorResponse = {
      statusCode: error?.response?.status || 500,
      message: error?.response?.data?.message || "Something went wrong!!!",
      errorMessages: error?.response?.data?.errors || [],
    };

    // Reject the promise with the error response so it can be handled by calling code
    return Promise.reject(errorResponse);
  },
);

export default axiosInstance;