// src/utils/validators.js

// Individual validation functions
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return 'ユーザー名を入力してください';
  }
  if (username.length < 3) {
    return 'ユーザー名は3文字以上である必要があります';
  }
  if (username.length > 20) {
    return 'ユーザー名は20文字以下である必要があります';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'ユーザー名には英数字とアンダースコアのみ使用できます';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'メールアドレスを入力してください';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '有効なメールアドレスを入力してください';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return 'パスワードを入力してください';
  }
  if (password.length < 6) {
    return 'パスワードは6文字以上である必要があります';
  }
  if (password.length > 128) {
    return 'パスワードは128文字以下である必要があります';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || !confirmPassword.trim()) {
    return 'パスワードを確認してください';
  }
  if (password !== confirmPassword) {
    return 'パスワードが一致しません';
  }
  return null;
};

// Strong password validation (optional)
export const validateStrongPassword = (password) => {
  const basicError = validatePassword(password);
  if (basicError) return basicError;

  if (!/(?=.*[a-z])/.test(password)) {
    return 'パスワードには少なくとも1つの小文字が必要です';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'パスワードには少なくとも1つの大文字が必要です';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'パスワードには少なくとも1つの数字が必要です';
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'パスワードには少なくとも1つの特殊文字(@$!%*?&)が必要です';
  }
  return null;
};

// Form validation functions
export const validateLoginForm = (form, loginType = 'email') => {
  const errors = {};

  // Validate based on login type
  if (loginType === 'email') {
    // Email-based login
    const emailError = validateEmail(form.email);
    if (emailError) errors.email = emailError;
  } else if (loginType === 'username') {
    // Username-based login
    const usernameError = validateUsername(form.username);
    if (usernameError) errors.username = usernameError;
  } else {
    // Fallback: Check which field is provided
    if (form.email !== undefined && form.email !== '') {
      const emailError = validateEmail(form.email);
      if (emailError) errors.email = emailError;
    } else if (form.username !== undefined && form.username !== '') {
      const usernameError = validateUsername(form.username);
      if (usernameError) errors.username = usernameError;
    } else {
      errors.general = 'メールアドレスまたはユーザー名を入力してください';
    }
  }

  // Always validate password
  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

export const validateRegisterForm = (form) => {
  const errors = {};

  const usernameError = validateUsername(form.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  // If you have confirm password field
  if (form.confirmPassword !== undefined) {
    const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  }

  // Additional fields validation
  if (form.firstName !== undefined && form.firstName && form.firstName.length > 50) {
    errors.firstName = '名は50文字以下である必要があります';
  }

  if (form.lastName !== undefined && form.lastName && form.lastName.length > 50) {
    errors.lastName = '姓は50文字以下である必要があります';
  }

  if (form.phoneNumber !== undefined && form.phoneNumber && !/^\+?[\d\s\-()]+$/.test(form.phoneNumber)) {
    errors.phoneNumber = '有効な電話番号を入力してください';
  }

  return errors;
};

// Helper function to check if form has errors
export const hasFormErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// Generic form validator
export const validateForm = (form, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const validator = rules[field];
    const value = form[field];
    
    // Skip validation if field is not in form
    if (value === undefined) return;
    
    const error = validator(value);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

// Validation rules objects for reusability
export const loginValidationRules = {
  username: validateUsername,
  password: validatePassword,
};

// Email-based login validation rules
export const emailLoginValidationRules = {
  email: validateEmail,
  password: validatePassword,
};

// Combined login validation rules (either email or username)
export const flexibleLoginValidationRules = (loginType) => {
  if (loginType === 'email') {
    return {
      email: validateEmail,
      password: validatePassword,
    };
  } else {
    return {
      username: validateUsername,
      password: validatePassword,
    };
  }
};

export const registerValidationRules = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword,
};

// Profile update validation rules
export const profileUpdateValidationRules = {
  username: (value) => value ? validateUsername(value) : null,
  email: (value) => value ? validateEmail(value) : null,
  firstName: (value) => value && value.length > 50 ? '名は50文字以下である必要があります' : null,
  lastName: (value) => value && value.length > 50 ? '姓は50文字以下である必要があります' : null,
  phoneNumber: (value) => value && !/^\+?[\d\s\-()]+$/.test(value) ? '有効な電話番号を入力してください' : null,
};

// Password change validation
export const validatePasswordChange = (form) => {
  const errors = {};

  if (!form.oldPassword || !form.oldPassword.trim()) {
    errors.oldPassword = '現在のパスワードを入力してください';
  }

  const newPasswordError = validatePassword(form.newPassword);
  if (newPasswordError) errors.newPassword = newPasswordError;

  const confirmPasswordError = validateConfirmPassword(form.newPassword, form.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  if (form.oldPassword && form.newPassword && form.oldPassword === form.newPassword) {
    errors.newPassword = '新しいパスワードは現在のパスワードと異なる必要があります';
  }

  return errors;
};

// Email verification token validation
export const validateVerificationToken = (token) => {
  if (!token || !token.trim()) {
    return '認証トークンが必要です';
  }
  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return '無効な認証トークン形式です';
  }
  return null;
};