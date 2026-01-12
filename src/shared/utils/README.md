# Utility Functions

This directory contains reusable utility functions used across the application.

## Use Case

Utility functions are used for:

- Common data transformations
- Date/time operations
- String manipulation
- Array operations
- Validation helpers
- Formatting functions

## Guidelines

- **Pure Functions**: Should not have side effects
- **Single Responsibility**: Each utility should do one thing well
- **Well-Tested**: Write tests for all utility functions
- **Type Safe**: Use TypeScript generics where appropriate
- **No Business Logic**: Keep domain logic in domain layer

## Example - String Utils

```typescript
// string.utils.ts
export class StringUtils {
  /**
   * Converts a string to slug format (lowercase, hyphen-separated)
   */
  static toSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Capitalizes the first letter of a string
   */
  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Truncates a string to a specified length
   */
  static truncate(text: string, length: number, suffix = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  }

  /**
   * Masks sensitive data (e.g., credit card, email)
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const masked = username.slice(0, 2) + '***' + username.slice(-1);
    return `${masked}@${domain}`;
  }
}
```

## Example - Date Utils

```typescript
// date.utils.ts
export class DateUtils {
  /**
   * Formats a date to ISO string
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Adds days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Calculates difference in days between two dates
   */
  static daysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if date is in the past
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Formats date to readable string
   */
  static formatDate(date: Date, locale = 'en-US'): string {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Gets start of day
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Gets end of day
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }
}
```

## Example - Array Utils

```typescript
// array.utils.ts
export class ArrayUtils {
  /**
   * Removes duplicate values from array
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * Chunks array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Groups array by a key
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      },
      {} as Record<string, T[]>,
    );
  }

  /**
   * Shuffles array randomly
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Finds intersection of two arrays
   */
  static intersection<T>(array1: T[], array2: T[]): T[] {
    return array1.filter((item) => array2.includes(item));
  }
}
```

## Example - Validation Utils

```typescript
// validation.utils.ts
export class ValidationUtils {
  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone number (simple version)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Validates URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if string is a valid UUID
   */
  static isUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Validates password strength
   */
  static isStrongPassword(password: string): boolean {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    );
  }
}
```

## Example - Object Utils

```typescript
// object.utils.ts
export class ObjectUtils {
  /**
   * Deep clones an object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Removes undefined/null values from object
   */
  static removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<T>);
  }

  /**
   * Picks specific keys from object
   */
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Pick<T, K> {
    return keys.reduce(
      (result, key) => {
        if (key in obj) {
          result[key] = obj[key];
        }
        return result;
      },
      {} as Pick<T, K>,
    );
  }

  /**
   * Omits specific keys from object
   */
  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  }
}
```

## Usage Example

```typescript
// In a service or controller
import { StringUtils } from '../../shared/utils/string.utils';
import { DateUtils } from '../../shared/utils/date.utils';
import { ValidationUtils } from '../../shared/utils/validation.utils';

export class UserService {
  createUser(email: string, name: string) {
    // Validate email
    if (!ValidationUtils.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Format name
    const formattedName = StringUtils.capitalize(name);

    // Set expiry date
    const expiryDate = DateUtils.addDays(new Date(), 30);

    return {
      email,
      name: formattedName,
      expiryDate,
    };
  }
}
```

## Testing Utils

```typescript
// test.utils.spec.ts
import { StringUtils } from './string.utils';

describe('StringUtils', () => {
  describe('toSlug', () => {
    it('should convert string to slug', () => {
      expect(StringUtils.toSlug('Hello World')).toBe('hello-world');
      expect(StringUtils.toSlug('Test 123!')).toBe('test-123');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const long = 'This is a very long string';
      expect(StringUtils.truncate(long, 10)).toBe('This is a...');
    });
  });
});
```
