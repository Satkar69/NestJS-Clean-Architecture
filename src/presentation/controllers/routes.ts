import { Routes } from '@nestjs/core';
import { UserControllerModule } from './user/user-controller.module';

const routes: Routes = [
  {
    path: '/v1',
    children: [
      {
        path: '/user',
        children: [UserControllerModule],
      },
    ],
  },
];

export default routes;
