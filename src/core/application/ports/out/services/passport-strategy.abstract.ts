import { Profile, VerifyCallback } from 'passport-google-oauth20';

export abstract class IGoogleStrategy {
  abstract validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void>;
}
