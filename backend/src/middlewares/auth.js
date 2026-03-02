import { requireAuth } from "@clerk/express";


export const verifyAuth = requireAuth({
    signInUrl: "/api/v1/sign-in", 
});
