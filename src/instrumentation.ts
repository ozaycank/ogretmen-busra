import { registerOTel } from "@vercel/otel";

export function register() {
    registerOTel({
        serviceName: "ogretmen-busra-backend",
    });
}