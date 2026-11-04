/**
 * Minimal ambient types for the Workers runtime module.
 *
 * `cloudflare:workers` only resolves inside workerd — the endpoint imports it
 * dynamically so a Node preview degrades to "no bindings" instead of crashing.
 * `@cloudflare/workers-types` would cover the whole platform surface; all this
 * app needs from it is `env`.
 */
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}