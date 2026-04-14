import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IBcryptService } from '@/src/core/application/ports/out/services/bcrypt.abstract';

@Injectable()
export class BcryptService implements IBcryptService {
  saltsRounds = 10;

  async hash(hashString: string): Promise<string> {
    return await bcrypt.hash(hashString, this.saltsRounds);
  }

  async compare(hashString: string, hashedString: string): Promise<boolean> {
    return await bcrypt.compare(hashString, hashedString);
  }
}
