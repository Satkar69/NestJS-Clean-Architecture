export abstract class IBcryptService {
  abstract hash(hashString: string): Promise<string>;
  abstract compare(hashString: string, hashedString: string): Promise<boolean>;
}
