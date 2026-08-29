export function readRuntimeEnv(name: string, buildValue?: string): string | undefined {
  return process.env[name] ?? buildValue;
}
