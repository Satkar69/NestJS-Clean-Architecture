import 'express';
import { UserClsStore } from '../interface/cls-store/user-cls.interface';

declare module 'express' {
  interface Request {
    user?: UserClsStore;
  }
}
