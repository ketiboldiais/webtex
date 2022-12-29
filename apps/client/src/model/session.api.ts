import { BASE, SESSION } from "@webtex/shared";
import { RootState } from "./store";

export const checkLogin = async (preloadedState: RootState) => {
  const response = await fetch(`${BASE}/${SESSION}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};