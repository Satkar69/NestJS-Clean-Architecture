# GitHub OAuth Strategy

This module implements GitHub OAuth 2.0 authentication strategy for the application.

## Overview

The GitHub authentication strategy allows users to authenticate using their GitHub account. This implementation follows OAuth 2.0 protocol and integrates with NestJS's authentication system.

## Configuration

### Environment Variables

Required environment variables for GitHub OAuth:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

### GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your application name
   - **Homepage URL**: Your application URL
   - **Authorization callback URL**: Must match `GITHUB_CALLBACK_URL`
4. Copy the Client ID and generate a Client Secret
5. Add these credentials to your `.env` file

## Implementation

### Strategy File

Create a `github.strategy.ts` file that:

- Extends PassportStrategy with 'github' as the strategy name
- Validates the OAuth token with GitHub
- Returns user profile information
- Handles user creation or retrieval in your database

### Service File

Create a `github-auth.service.ts` file that:

- Processes the authenticated user data
- Creates or updates user records
- Generates JWT tokens for session management
- Handles OAuth callback logic

### Module File

Create a `github-auth.module.ts` file that:

- Imports required dependencies (PassportModule, JwtModule, etc.)
- Provides the GitHub strategy and service
- Exports the strategy for use in other modules

## Usage

### Authentication Flow

1. **Initiate OAuth**: User clicks "Login with GitHub"

   ```
   GET /auth/github
   ```

2. **GitHub Authorization**: User is redirected to GitHub to authorize the application

3. **Callback**: GitHub redirects back to your callback URL with authorization code

   ```
   GET /auth/github/callback?code=...
   ```

4. **Token Generation**: Application exchanges code for access token and returns JWT

### Controller Integration

```typescript
@Controller('auth')
export class AuthController {
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req) {
    // Handles GitHub OAuth callback
    return this.authService.login(req.user);
  }
}
```

## Security Considerations

- Never commit Client ID or Client Secret to version control
- Use HTTPS in production for callback URLs
- Validate and sanitize all user data received from GitHub
- Implement rate limiting on authentication endpoints
- Store tokens securely (encrypted at rest)
- Set appropriate token expiration times

## Dependencies

```json
{
  "@nestjs/passport": "^10.0.0",
  "passport": "^0.6.0",
  "passport-github2": "^0.1.12"
}
```

## Scopes

Configure GitHub OAuth scopes based on required permissions:

- `user`: Read user profile data (default)
- `user:email`: Read user email addresses
- `read:user`: Read all user profile data

## Testing

Example test cases:

- Successful GitHub OAuth authentication
- Failed authentication (invalid credentials)
- User creation on first login
- User retrieval on subsequent logins
- Token generation and validation

## Troubleshooting

### Common Issues

**Invalid Callback URL**

- Ensure callback URL in GitHub app settings matches environment variable
- Check for trailing slashes and protocol (http/https)

**Authentication Fails**

- Verify Client ID and Secret are correct
- Check if GitHub app is active
- Ensure callback URL is accessible

**User Data Missing**

- Verify requested scopes in strategy configuration
- Check if user has granted required permissions

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport GitHub Strategy](http://www.passportjs.org/packages/passport-github2/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
