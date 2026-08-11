import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const headers = unsafeMethods.includes(req.method)
    ? req.headers.set('X-FinCoach-Request', '1')
    : req.headers;

  return next(
    req.clone({
      headers,
      withCredentials: true,
    }),
  );
};
