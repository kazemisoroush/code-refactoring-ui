/**
 * User model with utility methods
 */
export class User {
  constructor(userData) {
    this.id = userData?.id;
    this.email = userData?.email;
    this.name = userData?.name;
    this.username = userData?.username;
    this.firstName = userData?.firstName;
    this.lastName = userData?.lastName;
    this.avatar = userData?.avatar;
    this.roles = userData?.roles || [];
    this.createdAt = userData?.createdAt;
    this.updatedAt = userData?.updatedAt;

    // Copy any additional properties
    Object.keys(userData || {}).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = userData[key];
      }
    });
  }

  /**
   * Get the display name for the user
   * Priority: name -> firstName lastName -> username -> email -> 'User'
   */
  getDisplayName() {
    if (this.name) {
      return this.name;
    }

    if (this.firstName || this.lastName) {
      return [this.firstName, this.lastName].filter(Boolean).join(' ');
    }

    if (this.username) {
      return this.username;
    }

    if (this.email) {
      return this.email;
    }

    return 'User';
  }

  /**
   * Get the user's initials for avatar display
   */
  getInitials() {
    const displayName = this.getDisplayName();

    if (displayName === 'User') {
      return 'U';
    }

    // If it's an email, use the first letter of the local part
    if (displayName.includes('@')) {
      return displayName.charAt(0).toUpperCase();
    }

    // For names, get first letter of each word
    const words = displayName.split(' ').filter((word) => word.length > 0);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }

    return displayName.charAt(0).toUpperCase();
  }

  /**
   * Get a short display name (first name or username)
   */
  getShortDisplayName() {
    if (this.firstName) {
      return this.firstName;
    }

    if (this.name && this.name.includes(' ')) {
      return this.name.split(' ')[0];
    }

    if (this.name) {
      return this.name;
    }

    if (this.username) {
      return this.username;
    }

    if (this.email) {
      return this.email.split('@')[0];
    }

    return 'User';
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role) {
    return this.roles && this.roles.includes(role);
  }

  /**
   * Check if user is an admin
   */
  isAdmin() {
    return this.hasRole('admin') || this.hasRole('administrator');
  }

  /**
   * Get full name if available
   */
  getFullName() {
    if (this.firstName || this.lastName) {
      return [this.firstName, this.lastName].filter(Boolean).join(' ');
    }

    return this.name || this.getDisplayName();
  }
}

/**
 * Factory function to create User instances
 */
export const createUser = (userData) => {
  if (!userData) return null;
  return new User(userData);
};

/**
 * Helper function to ensure user object has methods
 */
export const enhanceUser = (userData) => {
  if (!userData) return null;

  // If it's already a User instance, return as is
  if (userData instanceof User) {
    return userData;
  }

  // Create new User instance
  return new User(userData);
};
