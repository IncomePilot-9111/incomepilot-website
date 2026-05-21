/**
 * Vitest stub for the `server-only` package.
 *
 * In the real Next.js build, `server-only` throws if imported by a client
 * component — that is enforced at bundle time by the React/Next.js compiler.
 * In the Vitest node environment that guard is not needed (every test file
 * already runs server-side), so this stub is a no-op to let the test suite
 * import server-only modules without errors.
 */
export {}
