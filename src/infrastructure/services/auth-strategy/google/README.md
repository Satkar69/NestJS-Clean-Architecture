# Google OAuth Strategy

This module implements Google OAuth 2.0 authentication strategy for the application.

## Overview

The Google authentication strategy allows users to authenticate using their Google account. This implementation follows OAuth 2.0 protocol and integrates with NestJS's authentication system.

## Configuration

### Environment Variables

Required environment variables for Google OAuth:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure OAuth consent screen if not already done
6. Select "Web application" as application type
7. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
8. Copy the Client ID and Client Secret
9. Add these credentials to your `.env` file

## Implementation

### Strategy File

Create a `google.strategy.ts` file that:

- Extends PassportStrategy with 'google' as the strategy name
- Validates the OAuth token with Google
- Returns user profile information (email, name, picture)
- Handles user creation or retrieval in your database

### Service File

Create a `google-auth.service.ts` file that:

- Processes the authenticated user data
- Creates or updates user records
- Generates JWT tokens for session management
- Handles OAuth callback logic
- Manages user profile synchronization

### Module File

Create a `google-auth.module.ts` file that:

- Imports required dependencies (PassportModule, JwtModule, etc.)
- Provides the Google strategy and service
- Exports the strategy for use in other modules

## Usage

### Authentication Flow

1. **Initiate OAuth**: User clicks "Login with Google"

   ```
   GET /auth/google
   ```

2. **Google Authorization**: User is redirected to Google to authorize the application

3. **Callback**: Google redirects back to your callback URL with authorization code

   ```
   GET /auth/google/callback?code=...
   ```

4. **Token Generation**: Application exchanges code for access token and returns JWT

### Controller Integration

```typescript
@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req) {
    // Handles Google OAuth callback
    return this.authService.login(req.user);
  }
}
```

## Security Considerations

- Never commit Client ID or Client Secret to version control
- Use HTTPS in production for callback URLs
- Validate and sanitize all user data received from Google
- Implement rate limiting on authentication endpoints
- Store tokens securely (encrypted at rest)
- Set appropriate token expiration times
- Implement CSRF protection for OAuth flows
- Validate state parameter to prevent CSRF attacks

## Dependencies

```json
{
  "@nestjs/passport": "^10.0.0",
  "passport": "^0.6.0",
  "passport-google-oauth20": "^2.0.0"
}
```

## Scopes

Configure Google OAuth scopes based on required permissions:

- `profile`: Access basic profile information (default)
- `email`: Access user's email address (default)
- `openid`: OpenID Connect authentication

Additional scopes can be added based on requirements:

- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`

## User Profile Data

Data returned from Google OAuth:

```typescript
{
  id: string; // Google user ID
  email: string; // User's email
  verified_email: boolean;
  name: string; // Display name
  given_name: string; // First name
  family_name: string; // Last name
  picture: string; // Profile picture URL
  locale: string; // User's locale
}
```

## Testing

Example test cases:

- Successful Google OAuth authentication
- Failed authentication (invalid credentials)
- User creation on first login
- User retrieval on subsequent logins
- Token generation and validation
- Email verification status check
- Profile picture URL validation

## Troubleshooting

### Common Issues

**Invalid Callback URL**

- Ensure callback URL in Google Console matches environment variable
- Check for exact match including protocol (http/https)
- Verify authorized redirect URIs in Google Console

**Authentication Fails**

- Verify Client ID and Secret are correct
- Check if OAuth consent screen is configured
- Ensure required APIs are enabled in Google Console

**Email Not Returned**

- Verify email scope is requested in strategy configuration
- Check OAuth consent screen settings
- Ensure user has granted email permission

**Access Denied Error**

- Check if user denied permission
- Verify OAuth consent screen is published (not in testing mode)
- Ensure user's email is in test users list if in testing mode

## OAuth Consent Screen

### Development Mode

- Add test users in Google Console
- Limited to 100 users
- Suitable for development and testing

### Production Mode

- Submit app for verification if using sensitive/restricted scopes
- Remove user limits
- Requires privacy policy and terms of service URLs

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Setup](https://developers.google.com/identity/sign-in/web/sign-in)
- [Passport Google OAuth Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
