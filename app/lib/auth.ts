import { compare, hash } from 'bcrypt';

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Compare a password with a hash
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}