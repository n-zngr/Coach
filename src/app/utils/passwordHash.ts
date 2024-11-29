import bcrypt from "bcrypt";

const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10; // Define the cost factor (recommended: 10-12)
    return await bcrypt.hash(password, saltRounds);
  };
  
  const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };


