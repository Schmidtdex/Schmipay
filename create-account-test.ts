import "dotenv/config";
import { auth } from "@/lib/auth";

export const signUp = async (name: string, email: string, password: string) => {
  try {
    await auth.api.createUser({
      body: {
        name,
        email,
        password,
      },
    });
    return {
      success: true,
      message: "Conta criada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message as string,
    };
  }
};

signUp("Test User", "test@example.com", "password123").then((result) => {
  console.log(result);
});
