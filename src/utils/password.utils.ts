import bcrypt from 'bcryptjs'

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, 10)
}
export const comparePasswords = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}
