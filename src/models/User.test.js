import { User, createUser, enhanceUser } from './User';

describe('User Model', () => {
  describe('constructor', () => {
    test('should create user with all properties', () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        name: 'John Doe',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.jpg',
        roles: ['user'],
        customProp: 'custom value'
      };

      const user = new User(userData);

      expect(user.id).toBe('1');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.username).toBe('johndoe');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.avatar).toBe('avatar.jpg');
      expect(user.roles).toEqual(['user']);
      expect(user.customProp).toBe('custom value');
    });

    test('should handle undefined userData', () => {
      const user = new User();
      expect(user.getDisplayName()).toBe('User');
    });
  });

  describe('getDisplayName', () => {
    test('should return name when available', () => {
      const user = new User({ name: 'John Doe' });
      expect(user.getDisplayName()).toBe('John Doe');
    });

    test('should return firstName lastName when name not available', () => {
      const user = new User({ firstName: 'John', lastName: 'Doe' });
      expect(user.getDisplayName()).toBe('John Doe');
    });

    test('should return firstName only when lastName not available', () => {
      const user = new User({ firstName: 'John' });
      expect(user.getDisplayName()).toBe('John');
    });

    test('should return lastName only when firstName not available', () => {
      const user = new User({ lastName: 'Doe' });
      expect(user.getDisplayName()).toBe('Doe');
    });

    test('should return username when name and firstName/lastName not available', () => {
      const user = new User({ username: 'johndoe' });
      expect(user.getDisplayName()).toBe('johndoe');
    });

    test('should return email when name, firstName/lastName, and username not available', () => {
      const user = new User({ email: 'test@example.com' });
      expect(user.getDisplayName()).toBe('test@example.com');
    });

    test('should return "User" when no identifying information available', () => {
      const user = new User({});
      expect(user.getDisplayName()).toBe('User');
    });

    test('should prioritize name over firstName/lastName', () => {
      const user = new User({
        name: 'Full Name',
        firstName: 'First',
        lastName: 'Last'
      });
      expect(user.getDisplayName()).toBe('Full Name');
    });
  });

  describe('getInitials', () => {
    test('should return initials for full name', () => {
      const user = new User({ name: 'John Doe' });
      expect(user.getInitials()).toBe('JD');
    });

    test('should return first letter for single name', () => {
      const user = new User({ name: 'John' });
      expect(user.getInitials()).toBe('J');
    });

    test('should return first letter of email local part', () => {
      const user = new User({ email: 'test@example.com' });
      expect(user.getInitials()).toBe('T');
    });

    test('should return "U" for default user', () => {
      const user = new User({});
      expect(user.getInitials()).toBe('U');
    });

    test('should handle firstName and lastName', () => {
      const user = new User({ firstName: 'John', lastName: 'Doe' });
      expect(user.getInitials()).toBe('JD');
    });
  });

  describe('getShortDisplayName', () => {
    test('should return firstName when available', () => {
      const user = new User({ firstName: 'John', lastName: 'Doe' });
      expect(user.getShortDisplayName()).toBe('John');
    });

    test('should return first word of name when firstName not available', () => {
      const user = new User({ name: 'John Doe Smith' });
      expect(user.getShortDisplayName()).toBe('John');
    });

    test('should return full name when it is single word', () => {
      const user = new User({ name: 'John' });
      expect(user.getShortDisplayName()).toBe('John');
    });

    test('should return username when name and firstName not available', () => {
      const user = new User({ username: 'johndoe' });
      expect(user.getShortDisplayName()).toBe('johndoe');
    });

    test('should return email local part when only email available', () => {
      const user = new User({ email: 'test@example.com' });
      expect(user.getShortDisplayName()).toBe('test');
    });
  });

  describe('getFullName', () => {
    test('should return firstName lastName when available', () => {
      const user = new User({ firstName: 'John', lastName: 'Doe' });
      expect(user.getFullName()).toBe('John Doe');
    });

    test('should return name when firstName/lastName not available', () => {
      const user = new User({ name: 'John Doe' });
      expect(user.getFullName()).toBe('John Doe');
    });

    test('should fallback to getDisplayName', () => {
      const user = new User({ email: 'test@example.com' });
      expect(user.getFullName()).toBe('test@example.com');
    });
  });

  describe('hasRole', () => {
    test('should return true for existing role', () => {
      const user = new User({ roles: ['admin', 'user'] });
      expect(user.hasRole('admin')).toBe(true);
      expect(user.hasRole('user')).toBe(true);
    });

    test('should return false for non-existing role', () => {
      const user = new User({ roles: ['user'] });
      expect(user.hasRole('admin')).toBe(false);
    });

    test('should handle empty roles array', () => {
      const user = new User({ roles: [] });
      expect(user.hasRole('admin')).toBe(false);
    });

    test('should handle undefined roles', () => {
      const user = new User({});
      expect(user.hasRole('admin')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    test('should return true for admin role', () => {
      const user = new User({ roles: ['admin'] });
      expect(user.isAdmin()).toBe(true);
    });

    test('should return true for administrator role', () => {
      const user = new User({ roles: ['administrator'] });
      expect(user.isAdmin()).toBe(true);
    });

    test('should return false for non-admin roles', () => {
      const user = new User({ roles: ['user'] });
      expect(user.isAdmin()).toBe(false);
    });
  });
});

describe('createUser', () => {
  test('should create User instance', () => {
    const userData = { name: 'John Doe' };
    const user = createUser(userData);
    expect(user).toBeInstanceOf(User);
    expect(user.getDisplayName()).toBe('John Doe');
  });

  test('should return null for undefined data', () => {
    const user = createUser();
    expect(user).toBeNull();
  });
});

describe('enhanceUser', () => {
  test('should return existing User instance unchanged', () => {
    const originalUser = new User({ name: 'John Doe' });
    const enhancedUser = enhanceUser(originalUser);
    expect(enhancedUser).toBe(originalUser);
  });

  test('should create new User instance from plain object', () => {
    const userData = { name: 'John Doe' };
    const enhancedUser = enhanceUser(userData);
    expect(enhancedUser).toBeInstanceOf(User);
    expect(enhancedUser.getDisplayName()).toBe('John Doe');
  });

  test('should return null for undefined data', () => {
    const enhancedUser = enhanceUser();
    expect(enhancedUser).toBeNull();
  });
});
