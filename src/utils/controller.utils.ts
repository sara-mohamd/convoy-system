import type { RequestHandler } from "express"

/**
 * Utility function to convert controller functions to Express RequestHandler type
 */
export const asHandler = <T extends (...args: any[]) => any>(fn: T): RequestHandler => {
  return fn as unknown as RequestHandler
}
