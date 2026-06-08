import { handlers } from "@/auth";

// NextAuth v5'in tüm GET ve POST işlemlerini (csrf, signin, signout, session) bu handler devralır
export const { GET, POST } = handlers;