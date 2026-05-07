const authService = require('../../../src/services/auth.service');
const userRepository = require('../../../src/repositories/user.repository');
const jwt = require('../../../src/utils/jwt');
const AppError = require('../../../src/utils/AppError');

// Mock external dependencies
jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/utils/jwt');

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUserData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
      };
      
      const mockCreatedUser = {
        _id: 'user123',
        ...mockUserData,
        toJSON: () => ({ _id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'user' }),
      };

      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockCreatedUser);
      jwt.generateToken.mockReturnValue('mocked-token');

      const result = await authService.register(mockUserData);

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(userRepository.create).toHaveBeenCalledWith(mockUserData);
      expect(jwt.generateToken).toHaveBeenCalledWith(mockCreatedUser._id, mockCreatedUser.role);
      
      expect(result.token).toBe('mocked-token');
      expect(result.user.email).toBe(mockUserData.email);
    });

    it('should throw an AppError if email already exists', async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(authService.register({ email: 'john@example.com' })).rejects.toThrow(AppError);
      await expect(authService.register({ email: 'john@example.com' })).rejects.toThrow('Email already registered');
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ _id: 'user123', email: 'john@example.com', role: 'user' }),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      jwt.generateToken.mockReturnValue('mocked-token');

      const result = await authService.login({ email: 'john@example.com', password: 'password123' });

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com', true);
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(jwt.generateToken).toHaveBeenCalledWith(mockUser._id, mockUser.role);
      
      expect(result.token).toBe('mocked-token');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw AppError if user is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: 'nonexistent@example.com', password: 'password123' })).rejects.toThrow('Invalid email or password');
    });

    it('should throw AppError if password does not match', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login({ email: 'john@example.com', password: 'wrongpassword' })).rejects.toThrow('Invalid email or password');
    });
  });
});
