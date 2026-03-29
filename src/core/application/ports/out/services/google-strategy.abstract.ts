export abstract class IGoogleStrategy {
  abstract validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<void>;
}
