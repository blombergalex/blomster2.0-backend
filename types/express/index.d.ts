// modify the global express request type

declare global {
  namespace Express {
    export interface Request {
      userId?: string
    }
  }
}

export {}