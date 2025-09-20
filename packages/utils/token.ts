// hash pwd,verify pwd,create access token,create refresh token, verify access n refresh token,hash refresh token,rotate tokens(generating new tokens)
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type AccessTokenPayload = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

type RefreshTokenPayload = {
  userId: string;
}

export const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, 12);
  return hash;
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const createAccessToken = (
  payload: AccessTokenPayload,
  secret: string,
  expiresIn: string 
): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const createRefreshToken = (
  payload: RefreshTokenPayload,
  secret: string,
  expiresIn: string 
): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyAccessToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const hashRefreshToken = async (token: string) => {
  return await bcrypt.hash(token, 12);
};

export const rotateTokens = (
  accessPayload: AccessTokenPayload, 
  refreshPayload: RefreshTokenPayload,
  accessSecret: string,
  refreshSecret: string
) => {
  return {
    accessToken: createAccessToken(accessPayload, accessSecret, "15m"),
    refreshToken: createRefreshToken(refreshPayload, refreshSecret, "7d"),
  };
};

