import express from "express";

import { AUTH, SESSION, USER } from "@webtex/shared";
import { register } from "../endpoints/post.auth.js";
import { login } from "../endpoints/post.user.js";
import { defaultHandler } from "../endpoints/get.root.js";
import { logout } from "../endpoints/delete.session.js";

const Router = express.Router();

Router.route("^/$|/index(.html)?").get(defaultHandler);
Router.route(AUTH).post(register);
Router.route(USER).post(login);
Router.route(SESSION).delete(logout);

export { Router };
