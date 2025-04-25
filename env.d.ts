declare module "bun" {
  interface Env {
    POSTGRES_URL: string;
    API_SECRET: string;
  }
}
export {};
