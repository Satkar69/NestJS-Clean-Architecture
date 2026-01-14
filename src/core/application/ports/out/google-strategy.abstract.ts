export abstract class IGoogleStrategy {
  abstract validate(profile: any, done: Function): Promise<void>;
}
