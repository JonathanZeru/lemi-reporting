import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<><h1>loading</h1></>}>
          <>home</>
      </Suspense>
    ),
  },
];

const router = createBrowserRouter(routes);

export default router;
