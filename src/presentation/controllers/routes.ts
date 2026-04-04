import { Routes } from '@nestjs/core';
import { AuthControllerModule } from './auth/auth-controller.module';

const routes: Routes = [
  {
    path: '/v1',
    children: [
      {
        path: '/auth',
        children: [AuthControllerModule],
      },
    ],
  },
];

export default routes;
