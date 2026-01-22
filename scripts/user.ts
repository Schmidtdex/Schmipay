import "dotenv/config";
console.log("Iniciando script de criação do usuário admin...");
import { auth } from "../lib/auth.js";

async function bootstrapAdmin() {
  const email = "guilherme.schmidt@sou.inteli.edu.com";
  const password = "Dlwschmidt14$";
  const name = "Guilherme Schmidt";

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    console.log("Usuário admin criado com sucesso");
  } catch (error) {
    const message = (error as Error).message;

    if (message.includes("already exists")) {
      console.log("Usuário admin já existe, nada a fazer");
      return;
    }

    console.error(" Erro ao criar admin:", message);
  }
}

bootstrapAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
