"use server";

import { auth } from "@/lib/auth";

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    return {
      success: true,
      message: "Login realizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message as string,
    };
  }
};

export const createUser = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    return {
      success: true,
      message: "Usuário criado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message as string,
    };
  }
};