declare module 'itty-router' {
  // Define a custom interface for the router's request that extends Cloudflare's Request
  interface IRequest extends Request {
    params: Record<string, string>;
  }

  interface RouterType {
    get(path: string, handler: (request: IRequest, ...args: any[]) => any): RouterType;
    post(path: string, handler: (request: IRequest, ...args: any[]) => any): RouterType;
    put(path: string, handler: (request: IRequest, ...args: any[]) => any): RouterType;
    delete(path: string, handler: (request: IRequest, ...args: any[]) => any): RouterType;
    options(path: string, handler: (request: IRequest, ...args: any[]) => any): RouterType;
    all(path: string, handler: (request: IRequest, ...args: any[]) => any): RouterType;
    handle(request: Request, ...args: any[]): Promise<Response>;
  }

  export function Router(): RouterType;
} 