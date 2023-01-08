import { Session } from "express-session";

export const client_origin = 'https://webtexdev.cloud';
export const server_origin = 'https://api.webtexdev.cloud';
export const auth_api_route = '/auth';
export const login_api_route = '/user';
export const logout_api_route = '/session';
export const refresh_api_route = '/refresh';

export type DateObj = {
  utcDate: string;
  localDate: string;
};

export type LoginReq = Request & {
  session: Session;
};

export type User = {
  email: string;
  password: string;
};

export type OTP = {
  email: string;
  otp: string;
};

export type LoginPayload = { accessToken: string; timestamp: string };
