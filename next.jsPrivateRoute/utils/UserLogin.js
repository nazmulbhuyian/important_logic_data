import { jwtDecode } from "jwt-decode";

import axiosInstance from "@/helpers/axiosInstance";
import { storeUserInfo } from "./auth";
import { BASE_URL } from "./constant";
import setAccessToken from "@/actions/setAccessToken";

const userLogin = async (payload) => {
  const urlParams = new URLSearchParams(window?.location?.search);
  const existingRedirectURL = urlParams.get("next");

  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/auth/login`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );

    const { accessToken, needPasswordChange } = response?.data || {};

    if (accessToken) {
      const role = jwtDecode(accessToken)?.role;

      storeUserInfo(accessToken);
      setAccessToken(accessToken, {
        needPasswordChange,
        redirect: existingRedirectURL
          ? existingRedirectURL
          : `/dashboard/${role === "SUPER_ADMIN" ? "super-admin" : role.toLowerCase()}`,
      });
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export default userLogin;
