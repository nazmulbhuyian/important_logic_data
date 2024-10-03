"use client";

import * as Yup from "yup";
import Link from "next/link";
import Image from "next/image";

import { useFormik } from "formik";
import { Button } from "antd";
import Container from "@/components/shared/Container";
import FormInput from "@/components/form/FormInput";
import loginIllustration from "@/public/image/login-illustration.png";
import userLogin from "@/utils/userLogin";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "super@admin.com",
      password: "superadmin",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);

      const promise = (async () => {
        await userLogin(values);
      })();

      promise.finally(() => setLoading(false));

      toast.promise(promise, {
        loading: "Logging in...",
        success: "Logged in successfully",
        error: (error) => error.message || "Failed to login",
      });
    },
  });

  return (
    <Container className="py-0 lg:py-0">
      <div className="flex justify-evenly gap-5 text-base lg:min-h-[calc(100vh-80px)] lg:items-center">
        <div className="hidden w-7/12 lg:block">
          <Image src={loginIllustration} alt="telehealth login" />
        </div>
        <div className="max-xs:w-full xs:w-6/12 lg:w-5/12">
          <p className="mb-5 text-2xl font-semibold max-lg:mt-10 max-lg:text-center md:text-3xl lg:mb-8">
            Sign in to your account
          </p>
          <form className="space-y-1 lg:mr-14" onSubmit={formik.handleSubmit}>
            <div className="space-y-2">
              <FormInput
                label="Email"
                name="email"
                placeholder="Enter your email"
                formik={formik}
                required
              />

              <div>
                <FormInput
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  formik={formik}
                  required
                />
                <Link href="/forgot-password" className="flex justify-end">
                  <Button
                    type="link"
                    className="!p-0 text-primary hover:underline"
                  >
                    Forgot password?
                  </Button>
                </Link>
              </div>
            </div>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-5 text-center lg:mr-14">
            <p>{`Don't have an account?`} </p>
            <Link href="/register">
              <Button type="link" className="!p-0 text-primary hover:underline">
                Create New Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
