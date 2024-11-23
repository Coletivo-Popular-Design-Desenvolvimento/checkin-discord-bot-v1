import { promises as fs } from "fs";

// Lê os usuários cadastrados
export const readUsers = async () => {
  try {
    const data = await fs.readFile("users.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // Arquivo não encontrado, retorna um objeto vazio
      return {};
    }
    throw error;
  }
};

// Salva os usuários cadastrados
export const saveUsers = async (users) => {
  try {
    await fs.writeFile("users.json", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Erro ao salvar usuários:", error);
  }
};
