import { Routes } from '@nestjs/core';
import { AuthControllerModule } from './auth/auth-controller.module';
import { UserControllerModule } from './user/user-controller.module';

const routes: Routes = [
  {
    path: '/v1',
    children: [
      {
        path: '/auth',
        children: [AuthControllerModule],
      },
      {
        path: '/user',
        children: [UserControllerModule],
      },
    ],
  },
];

export default routes;
