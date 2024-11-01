import { app, handle } from "@acme/api";

export const runtime = "edge";

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
