import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  DollarSign, 
  Users, 
  MessageCircle, 
  Lightbulb,
  Star,
  Send,
  Menu,
  X,
  Home,
  User,
  Briefcase,
  BookOpen,
  LogIn,
  UserPlus,
  Download,
  Edit3,
  CheckCircle,
  Award,
  Book,
  Briefcase as WorkIcon,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Link,
  Zap,
  Eye,
  FileCheck,
  TrendingUp,
  Target,
  Scale,
  Clock,
  Lock,
  EyeOff
} from 'lucide-react';

// Auth Context for managing user state
const AuthContext = React.createContext();

// Auth Provider Component
// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('📨 Login response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration:', userData);
      
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('📨 Registration response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading: isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component
const LoginScreen = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Login</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

// Register Component
const RegisterScreen = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    currentRole: '',
    experience: '',
    skills: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || '',
      location: formData.location || '',
      current_role: formData.currentRole || '',
      experience_years: formData.experience ? parseInt(formData.experience) : 0,
      skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : []
    };

    const result = await register(userData);
    
    if (!result.success) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Create Account</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Your city"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Current Role
              </label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => handleChange('currentRole', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Years of experience"
                min="0"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Skills
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter skills separated by commas"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
};

// User Profile Component
const UserProfile = ({ onClose }) => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    currentRole: user?.current_role || '',
    experience: user?.experience_years || '',
    skills: user?.skills?.join(', ') || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          location: formData.location,
          current_role: formData.currentRole,
          experience_years: parseInt(formData.experience) || 0,
          skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>User Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {message && (
          <div style={{
            background: message.includes('Error') ? '#fef2f2' : '#f0f9ff',
            border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bae6fd'}`,
            color: message.includes('Error') ? '#dc2626' : '#059669',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: '#667eea',
            color: 'white',
            borderRadius: '50%',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: '0 auto 1rem'
          }}>
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <h3 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
            {user.first_name} {user.last_name}
          </h3>
          <p style={{ textAlign: 'center', color: '#6b7280' }}>{user.email}</p>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: !isEditing ? '#f9fafb' : 'white',
                  color: !isEditing ? '#6b7280' : '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: !isEditing ? '#f9fafb' : 'white',
                  color: !isEditing ? '#6b7280' : '#1f2937'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: '#f9fafb',
                color: '#6b7280'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: !isEditing ? '#f9fafb' : 'white',
                  color: !isEditing ? '#6b7280' : '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: !isEditing ? '#f9fafb' : 'white',
                  color: !isEditing ? '#6b7280' : '#1f2937'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Current Role
              </label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => handleChange('currentRole', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: !isEditing ? '#f9fafb' : 'white',
                  color: !isEditing ? '#6b7280' : '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: !isEditing ? '#f9fafb' : 'white',
                  color: !isEditing ? '#6b7280' : '#1f2937'
                }}
                min="0"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Skills
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                background: !isEditing ? '#f9fafb' : 'white',
                color: !isEditing ? '#6b7280' : '#1f2937'
              }}
              placeholder="Enter skills separated by commas"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              background: 'white',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    location: user.location || '',
                    currentRole: user.current_role || '',
                    experience: user.experience_years || '',
                    skills: user.skills?.join(', ') || ''
                  });
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#4b5563',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn-primary"
                style={{ 
                  padding: '0.75rem 1.5rem',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Separate ChatInput component to prevent re-renders
const ChatInput = React.memo(({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, isLoading, onSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type your message here..."
        disabled={isLoading}
        style={{
          flex: '1',
          padding: '0.75rem 1rem',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '0.875rem',
          outline: 'none',
          opacity: isLoading ? 0.7 : 1
        }}
      />
      <button
        onClick={handleSend}
        disabled={isLoading || !message.trim()}
        className="btn-primary"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.75rem 1.5rem',
          opacity: (isLoading || !message.trim()) ? 0.7 : 1
        }}
      >
        <Send size={16} />
        <span>Send</span>
      </button>
    </div>
  );
});

// Separate ChatInterface component
const ChatInterface = React.memo(({ chatHistory, isLoading, onSendMessage, onClearChat }) => {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageCircle size={24} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Chat with Career Assistant</h3>
        </div>
        <button 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px' }}
          onClick={onClearChat}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="chat-container" ref={chatContainerRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type}`}>
            <div className={`message-bubble ${msg.type}`}>
              {msg.type === 'assistant' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div className="assistant-avatar">CC</div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Career Assistant</span>
                </div>
              )}
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-bubble assistant">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="assistant-avatar">CC</div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Career Assistant</span>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', background: '#f8f9fa', padding: '1rem' }}>
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
});

// Separate SuggestedQueries component
const SuggestedQueries = React.memo(({ queries, onQueryClick }) => (
  <div className="card">
    <div className="card-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Lightbulb size={24} color="#667eea" />
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Suggested Queries</h3>
      </div>
      <div>
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQueryClick(query)}
            className="query-button"
          >
            <Search size={16} className="query-icon" />
            <span className="query-text">{query}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
));

// Separate SuccessStories component
const SuccessStories = React.memo(() => {
  const successStories = [
    {
      name: "Priya S.",
      role: "Software Engineer",
      avatar: "PS",
      quote: "Career Compass helped me negotiate a 25% higher salary than what was initially offered. The interview prep was invaluable!",
      color: "bg-purple-500"
    },
    {
      name: "Anita K.",
      role: "Product Manager",
      avatar: "AK", 
      quote: "Found my dream job at a company with amazing work-life balance. This platform understands the unique challenges women face.",
      color: "bg-indigo-500"
    },
    {
      name: "Meera T.",
      role: "Data Scientist",
      avatar: "MT",
      quote: "The AI recommendations were spot-on. Got placed at a top tech company with excellent growth opportunities.",
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Star size={24} color="#667eea" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Success Stories</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {successStories.map((story, index) => (
            <div key={index} className="success-story">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div className={`story-avatar ${story.color}`} style={{ background: story.color === 'bg-purple-500' ? '#8b5cf6' : story.color === 'bg-indigo-500' ? '#6366f1' : '#ec4899' }}>
                  {story.avatar}
                </div>
                <div style={{ flex: '1' }}>
                  <blockquote>"{story.quote}"</blockquote>
                  <div>
                    <p className="story-author">{story.name}</p>
                    <p className="story-role">{story.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Separate FeaturesSection component
const FeaturesSection = React.memo(() => {
  const features = [
    {
      icon: Search,
      title: "Smart Job Search",
      description: "Find positions at companies known for supporting women's career growth in India",
      color: "text-purple-600"
    },
    {
      icon: FileText,
      title: "Resume Builder", 
      description: "Create standout resumes that highlight your achievements effectively for Indian market",
      color: "text-purple-600"
    },
    {
      icon: DollarSign,
      title: "Salary Negotiation",
      description: "Get personalized advice to negotiate better pay and benefits with Indian salary standards",
      color: "text-purple-600"
    },
  ];

  return (
    <div style={{ padding: '4rem 0', background: '#f9fafb' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            How Career Compass Helps You Succeed
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
            Tools and resources designed specifically for job seekers in India
          </p>
        </div>
        
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon size={32} color="#667eea" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Resume Builder Step Components
const PersonalInfoStep = ({ formData, onChange }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        Personal Information
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            placeholder="Enter your phone number"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            placeholder="Enter your city"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>LinkedIn</label>
          <input
            type="url"
            value={formData.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            placeholder="LinkedIn profile URL"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>GitHub</label>
          <input
            type="url"
            value={formData.github || ''}
            onChange={(e) => handleChange('github', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            placeholder="GitHub profile URL"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Portfolio</label>
          <input
            type="url"
            value={formData.portfolio || ''}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            placeholder="Portfolio website URL"
          />
        </div>
      </div>
    </div>
  );
};

const ProfessionalSummaryStep = ({ formData, onChange }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        Professional Summary
      </h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Role *</label>
        <input
          type="text"
          value={formData.targetRole || ''}
          onChange={(e) => handleChange('targetRole', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}
          placeholder="e.g., Senior Software Engineer"
        />
        
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Professional Summary *</label>
        <textarea
          value={formData.summary || ''}
          onChange={(e) => handleChange('summary', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minHeight: '120px'
          }}
          placeholder="Write a compelling 2-3 sentence summary highlighting your experience, skills, and career goals..."
        />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Tip: Include keywords from your target job description for better ATS compatibility
        </p>
      </div>
    </div>
  );
};

const WorkExperienceStep = ({ formData, onChange, onAddExperience, onRemoveExperience }) => {
  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...formData.experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    onChange('experiences', updatedExperiences);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        Work Experience
      </h3>
      
      {formData.experiences.map((exp, index) => (
        <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: '600' }}>Experience #{index + 1}</h4>
            {index > 0 && (
              <button
                onClick={() => onRemoveExperience(index)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Remove
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company *</label>
              <input
                type="text"
                value={exp.company || ''}
                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="Company name"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Job Title *</label>
              <input
                type="text"
                value={exp.role || ''}
                onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="Your job title"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Start Date</label>
              <input
                type="month"
                value={exp.startDate || ''}
                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>End Date</label>
              <input
                type="month"
                value={exp.endDate || ''}
                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                disabled={exp.current}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  opacity: exp.current ? 0.5 : 1
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
              <input
                type="checkbox"
                checked={exp.current || false}
                onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label style={{ fontWeight: '500' }}>Current Job</label>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Job Description</label>
            <textarea
              value={exp.description || ''}
              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                minHeight: '80px'
              }}
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      ))}
      
      <button
        onClick={onAddExperience}
        style={{
          background: 'none',
          border: '2px dashed #d1d5db',
          color: '#6b7280',
          padding: '1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          width: '100%',
          fontSize: '0.875rem'
        }}
      >
        + Add Another Experience
      </button>
    </div>
  );
};

const SkillsStep = ({ formData, onChange }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        Skills & Technologies
      </h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Technical Skills *</label>
        <textarea
          value={formData.technicalSkills || ''}
          onChange={(e) => handleChange('technicalSkills', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minHeight: '80px'
          }}
          placeholder="Enter technical skills separated by commas (e.g., Python, React, AWS, Machine Learning)"
        />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Include programming languages, frameworks, libraries, and technical tools
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Soft Skills</label>
        <textarea
          value={formData.softSkills || ''}
          onChange={(e) => handleChange('softSkills', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minHeight: '80px'
          }}
          placeholder="Enter soft skills separated by commas (e.g., Leadership, Communication, Problem Solving)"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tools & Platforms</label>
        <textarea
          value={formData.tools || ''}
          onChange={(e) => handleChange('tools', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minHeight: '80px'
          }}
          placeholder="Enter tools and platforms separated by commas (e.g., Git, Docker, Jenkins, JIRA)"
        />
      </div>
    </div>
  );
};

// Salary Negotiator Component
const SalaryNegotiatorScreen = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    currentSalary: '',
    targetSalary: '',
    jobTitle: '',
    location: '',
    experience: '',
    skills: [],
    company: '',
    industry: 'Technology',
    companySize: 'large'
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  const handleFormDataChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePredictSalary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/salary/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: formData.jobTitle,
          location: formData.location,
          experience_years: parseInt(formData.experience) || 0,
          company: formData.company,
          industry: formData.industry,
          company_size: formData.companySize,
          skills: formData.skills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to predict salary');
      }

      const result = await response.json();
      setPredictionResult(result);
      
      // Also fetch comparison data
      if (formData.jobTitle && formData.location) {
        fetchComparisonData(formData.jobTitle, [formData.location, 'Bangalore', 'Mumbai', 'Hyderabad']);
      }
      
    } catch (error) {
      console.error('Error predicting salary:', error);
      alert('Failed to predict salary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComparisonData = async (jobTitle, locations) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/salary/comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: jobTitle,
          locations: locations
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    }
  };

  const getNegotiationStrategy = () => {
    if (!predictionResult || !formData.currentSalary) return [];
    
    const current = parseFloat(formData.currentSalary);
    const predicted = predictionResult.prediction?.salary || 0;
    const percentageIncrease = ((predicted - current) / current) * 100;
    
    const strategies = [];
    
    if (percentageIncrease > 50) {
      strategies.push("Your target represents a significant increase. Focus on demonstrating new skills and value you bring.");
      strategies.push("Consider a phased approach: ask for 70% of the increase now, with the rest tied to performance reviews.");
    } else if (percentageIncrease > 25) {
      strategies.push("This is a reasonable increase. Emphasize your experience and market value.");
      strategies.push("Be prepared with specific examples of your achievements and how they translate to business value.");
    } else {
      strategies.push("This is a modest increase. You have strong negotiating power.");
      strategies.push("Consider asking for additional benefits like flexible work arrangements or professional development budget.");
    }
    
    strategies.push("Research the company's compensation philosophy and recent funding rounds.");
    strategies.push("Practice your negotiation conversation with specific talking points.");
    strategies.push("Consider the total package: base salary, bonuses, equity, and benefits.");
    
    return strategies;
  };

  const steps = [
    {
      title: 'Current Situation',
      component: ({ formData, onChange }) => (
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
            Current Situation
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Current Salary (₹)*</label>
              <input
                type="number"
                value={formData.currentSalary}
                onChange={(e) => onChange('currentSalary', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter your current annual salary"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Salary (₹)</label>
              <input
                type="number"
                value={formData.targetSalary}
                onChange={(e) => onChange('targetSalary', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter your target salary"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Job Title *</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => onChange('jobTitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Experience (Years)*</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => onChange('experience', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="Years of experience"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Job Details',
      component: ({ formData, onChange }) => (
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
            Job Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location *</label>
              <select
                value={formData.location}
                onChange={(e) => onChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Select location</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Delhi">Delhi</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => onChange('company', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="Company name"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => onChange('industry', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Retail">Retail</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company Size</label>
              <select
                value={formData.companySize}
                onChange={(e) => onChange('companySize', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="startup">Startup</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Key Skills</label>
            <input
              type="text"
              value={formData.skills.join(', ')}
              onChange={(e) => onChange('skills', e.target.value.split(',').map(skill => skill.trim()))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
              placeholder="Enter skills separated by commas (e.g., Python, React, AWS)"
            />
          </div>
        </div>
      )
    }
  ];

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                marginBottom: '0.5rem'
              }}
            >
              ← Back to Home
            </button>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937' }}>Salary Negotiator</h1>
            <p style={{ color: '#6b7280' }}>Get data-driven salary insights and negotiation strategies</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: predictionResult ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          {/* Left Side - Form */}
          <div className="card">
            <div className="card-body">
              {/* Progress Steps */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index + 1)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: currentStep === index + 1 ? '#667eea' : '#f3f4f6',
                      color: currentStep === index + 1 ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    {step.title}
                  </button>
                ))}
              </div>

              {!predictionResult ? (
                <>
                  {CurrentStepComponent && (
                    <CurrentStepComponent 
                      formData={formData}
                      onChange={handleFormDataChange}
                    />
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button
                      onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                      disabled={currentStep === 1}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#4b5563',
                        cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentStep === 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>
                    
                    {currentStep < steps.length ? (
                      <button
                        onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                        className="btn-primary"
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        onClick={handlePredictSalary}
                        disabled={isLoading || !formData.currentSalary || !formData.jobTitle || !formData.location || !formData.experience}
                        className="btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem'
                        }}
                      >
                        {isLoading ? (
                          <>
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp size={16} />
                            <span>Get Salary Insights</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ 
                    background: '#f0f9ff', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    marginBottom: '1.5rem',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <CheckCircle size={24} color="#059669" />
                      <h3 style={{ color: '#059669', fontWeight: '600' }}>Salary Analysis Complete!</h3>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Market Salary Range</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                          ₹{predictionResult.prediction?.range?.min?.toLocaleString() || '0'} - ₹{predictionResult.prediction?.range?.max?.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Confidence</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea' }}>
                          {((predictionResult.prediction?.confidence || 0) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPredictionResult(null)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#4b5563',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Edit3 size={16} />
                    <span>Analyze Another Salary</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Results */}
          {predictionResult && (
            <div>
              {/* Salary Comparison */}
              {comparisonData && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <div className="card-body">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={18} />
                      Location Comparison
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {comparisonData.location_comparison?.slice(0, 4).map((location, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: index === 0 ? '#f0f9ff' : 'transparent',
                          borderRadius: '6px',
                          border: index === 0 ? '1px solid #bae6fd' : 'none'
                        }}>
                          <span style={{ fontWeight: index === 0 ? '600' : '400' }}>{location.location}</span>
                          <span style={{ fontWeight: '600', color: '#059669' }}>
                            ₹{location.base_salary?.toLocaleString() || '0'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Negotiation Strategies */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Scale size={18} />
                    Negotiation Strategy
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {getNegotiationStrategy().map((strategy, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.5rem',
                        padding: '0.5rem 0'
                      }}>
                        <div style={{ 
                          width: '4px', 
                          height: '4px', 
                          background: '#667eea', 
                          borderRadius: '50%',
                          marginTop: '0.5rem',
                          flexShrink: 0
                        }}></div>
                        <span style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Insights */}
              {predictionResult.market_analysis && (
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={18} />
                      Market Insights
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Growth Rate</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#059669' }}>
                          {predictionResult.market_analysis.growth_rate}%
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Demand Level</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {predictionResult.market_analysis.demand_supply_ratio > 1.5 ? 'High' : 'Medium'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Resume Builder Screen Component
const ResumeBuilderScreen = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    
    // Professional Summary
    summary: '',
    targetRole: '',
    
    // Work Experience
    experiences: [{
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: '',
      achievements: ['']
    }],
    
    // Skills
    technicalSkills: '',
    softSkills: '',
    tools: '',
  });

  const [resumeResult, setResumeResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(0);

  // Handle form data changes
  const handleFormDataChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddExperience = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        description: '',
        achievements: ['']
      }]
    }));
  }, []);

  const handleRemoveExperience = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  }, []);

  const calculateAtsScore = useCallback(() => {
    let score = 0;
    const { name, email, experiences, technicalSkills, summary } = formData;

    // Basic information (20 points)
    if (name && email) score += 20;

    // Work experience (30 points)
    if (experiences[0]?.company && experiences[0]?.role) score += 30;

    // Skills (30 points)
    if (technicalSkills && technicalSkills.split(',').length >= 3) score += 30;

    // Professional summary (20 points)
    if (summary && summary.length > 50) score += 20;

    setAtsScore(Math.min(score, 100));
  }, [formData]);

  useEffect(() => {
    calculateAtsScore();
  }, [calculateAtsScore]);

  const handleBuildResume = async () => {
    setIsLoading(true);
    try {
      // Process skills from comma-separated strings to arrays
      const processedData = {
        ...formData,
        technicalSkills: formData.technicalSkills.split(',').map(skill => skill.trim()).filter(skill => skill),
        softSkills: formData.softSkills.split(',').map(skill => skill.trim()).filter(skill => skill),
        tools: formData.tools.split(',').map(tool => tool.trim()).filter(tool => tool),
      };

      const userProfile = {
        name: processedData.name,
        email: processedData.email,
        phone: processedData.phone,
        location: processedData.location,
        linkedin: processedData.linkedin,
        github: processedData.github,
        portfolio: processedData.portfolio,
        current_role: processedData.experiences[0]?.role || '',
        experience_years: calculateExperienceYears(),
        skills: [...processedData.technicalSkills, ...processedData.softSkills, ...processedData.tools],
        education: [],
        experiences: processedData.experiences,
        projects: [],
        certifications: [],
        achievements: [],
        target_role: processedData.targetRole
      };

      const response = await fetch('http://127.0.0.1:5000/api/resume/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: userProfile,
          template: 'professional',
          target_role: processedData.targetRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to build resume');
      }

      const result = await response.json();
      setResumeResult(result);
      
    } catch (error) {
      console.error('Error building resume:', error);
      alert('Failed to build resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateExperienceYears = () => {
    if (!formData.experiences.length) return 0;
    
    const experiences = formData.experiences.filter(exp => exp.startDate);
    if (!experiences.length) return 0;

    const startDates = experiences.map(exp => new Date(exp.startDate));
    const earliestDate = new Date(Math.min(...startDates));
    const currentDate = new Date();
    
    return Math.round((currentDate - earliestDate) / (365 * 24 * 60 * 60 * 1000));
  };

  const downloadPDF = () => {
    if (resumeResult?.pdf_data) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${resumeResult.pdf_data}`;
      link.download = `resume-${formData.name}-${new Date().getTime()}.pdf`;
      link.click();
    } else {
      // Fallback: Create a simple PDF download
      const element = document.createElement('a');
      const file = new Blob([`Resume for ${formData.name}\n\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nSummary: ${formData.summary}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `resume-${formData.name}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const steps = [
    { 
      component: PersonalInfoStep, 
      title: 'Personal Info', 
      icon: User,
    },
    { 
      component: ProfessionalSummaryStep, 
      title: 'Summary', 
      icon: FileText,
    },
    { 
      component: WorkExperienceStep, 
      title: 'Experience', 
      icon: WorkIcon,
    },
    { 
      component: SkillsStep, 
      title: 'Skills', 
      icon: Zap,
    }
  ];

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                marginBottom: '0.5rem'
              }}
            >
              ← Back to Home
            </button>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937' }}>AI Resume Builder</h1>
            <p style={{ color: '#6b7280' }}>Create an ATS-friendly resume that gets you noticed</p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              background: '#667eea', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px',
              marginBottom: '0.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>ATS Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{atsScore}%</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Sidebar - Progress Steps */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Build Your Resume</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index + 1)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      background: currentStep === index + 1 ? '#667eea' : 'transparent',
                      color: currentStep === index + 1 ? 'white' : '#4b5563',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: currentStep === index + 1 ? 'white' : '#e5e7eb',
                      color: currentStep === index + 1 ? '#667eea' : '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <step.icon size={16} />
                    <span style={{ fontWeight: '500' }}>{step.title}</span>
                  </button>
                ))}
              </div>

              {/* ATS Tips */}
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck size={16} />
                  ATS Optimization Tips
                </h4>
                <ul style={{ fontSize: '0.75rem', color: '#4b5563', paddingLeft: '1.25rem' }}>
                  <li>Use standard section headings</li>
                  <li>Include relevant keywords</li>
                  <li>Use bullet points for achievements</li>
                  <li>Avoid graphics and tables</li>
                  <li>Save as PDF format</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="card">
            <div className="card-body">
              {resumeResult ? (
                <div>
                  <div style={{ 
                    background: '#f0f9ff', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    marginBottom: '1.5rem',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <CheckCircle size={24} color="#059669" />
                      <h3 style={{ color: '#059669', fontWeight: '600' }}>Resume Built Successfully!</h3>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Optimization Tips:</h4>
                      <ul style={{ paddingLeft: '1.5rem', color: '#4b5563' }}>
                        {resumeResult.optimization_tips?.slice(0, 3).map((tip, index) => (
                          <li key={index} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setResumeResult(null)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#4b5563',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Edit3 size={16} />
                      <span>Edit Again</span>
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem'
                      }}
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {CurrentStepComponent && (
                    <CurrentStepComponent 
                      formData={formData}
                      onChange={handleFormDataChange}
                      onAddExperience={handleAddExperience}
                      onRemoveExperience={handleRemoveExperience}
                    />
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button
                      onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                      disabled={currentStep === 1}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#4b5563',
                        cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentStep === 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>
                    
                    {currentStep < steps.length ? (
                      <button
                        onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                        className="btn-primary"
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        onClick={handleBuildResume}
                        disabled={isLoading}
                        className="btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem'
                        }}
                      >
                        {isLoading ? (
                          <>
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <span>Building Resume...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={16} />
                            <span>Build Resume</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate Header component
const Header = React.memo(({ activeTab, onTabChange, windowWidth, isMenuOpen, onMenuToggle, onShowLogin, onShowRegister, onShowProfile }) => {
  const { user, logout } = useAuth();
  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs' },
    { id: 'resume', icon: FileText, label: 'Resume Builder' },
    { id: 'salary', icon: DollarSign, label: 'Salary Negotiator' },
    { id: 'resources', icon: BookOpen, label: 'Resources' }
  ];

  const handleLogout = () => {
    logout();
    onTabChange('home');
  };

  return (
    <header className="header">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px' }}>
              <Lightbulb size={24} color="#667eea" />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Career Compass India</h1>
          </div>
          
          <nav style={{ display: windowWidth >= 768 ? 'flex' : 'none', alignItems: 'center', gap: '1.5rem' }}>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display: windowWidth >= 768 ? 'flex' : 'none', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={onShowProfile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <User size={16} />
                  <span>{user.first_name}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={onShowLogin}
                  className="btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </button>
                <button 
                  onClick={onShowRegister}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <UserPlus size={16} />
                  <span>Register</span>
                </button>
              </>
            )}
          </div>

          <button 
            style={{ 
              display: windowWidth < 768 ? 'block' : 'none',
              background: 'none',
              border: 'none',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={onMenuToggle}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onMenuToggle();
                  }}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px'
                  }}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                {user ? (
                  <>
                    <button 
                      onClick={() => {
                        onShowProfile();
                        onMenuToggle();
                      }}
                      className="nav-item" 
                      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem' }}
                    >
                      <User size={16} />
                      <span>Profile ({user.first_name})</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleLogout();
                        onMenuToggle();
                      }}
                      className="nav-item" 
                      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem' }}
                    >
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        onShowLogin();
                        onMenuToggle();
                      }}
                      className="nav-item" 
                      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem' }}
                    >
                      <LogIn size={16} />
                      <span>Login</span>
                    </button>
                    <button 
                      onClick={() => {
                        onShowRegister();
                        onMenuToggle();
                      }}
                      className="nav-item" 
                      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem' }}
                    >
                      <UserPlus size={16} />
                      <span>Register</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
});

// Main CareerCompass component
const CareerCompass = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'assistant',
      message: "Hi there! I'm your AI career assistant. How can I help you today? You can ask me about job searches, resume tips, interview preparation, or companies that are known for supporting women in the Indian workplace."
    }
  ]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Auth modal states
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Job search state
  const [jobFilters, setJobFilters] = useState({
    query: '',
    location: 'Bangalore',
    skills: [],
    experience: 0
  });
  const [jobResults, setJobResults] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const suggestedQueries = [
    "Find software engineer jobs in Bangalore",
    "How to prepare for a technical interview",
    "Companies with good maternity leave policies in India",
    "Salary negotiation tips for women in tech",
    "Remote work opportunities for Indian companies"
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Send message function
  const sendMessage = useCallback(async (message) => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      console.log('Sending message:', userMessage);
      
      const newMessage = { type: 'user', message: userMessage };
      setChatHistory(prev => [...prev, newMessage]);
      setIsLoading(true);
      
      try {
        const response = await fetch('http://127.0.0.1:5000/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage,
            user_id: 'current-user-id'
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Backend response:', data);
        
        let assistantMessage;
        
        if (data.response && data.response.message) {
          assistantMessage = data.response.message;
        } else if (data.message) {
          assistantMessage = data.message;
        } else {
          assistantMessage = "I'm not sure how to respond to that. Could you rephrase your question?";
        }
        
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          message: assistantMessage 
        }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          message: "I'm having trouble connecting right now. Please check your connection and try again." 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  // Function to fetch jobs from backend
  const searchJobs = useCallback(async (filters = {}) => {
    setIsLoadingJobs(true);
    setSearchPerformed(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobResults(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to sample data if API fails
      setJobResults([
        {
          '_id': '1',
          'title': 'Senior Software Engineer - Python',
          'company': 'Flipkart',
          'location': 'Bangalore',
          'experience': '3-5 years',
          'salary_range': '15-25 LPA',
          'skills_required': ['Python', 'Django', 'REST APIs', 'PostgreSQL'],
          'job_url': 'https://www.flipkartcareers.com/job123',
          'posted_date': '2024-01-15',
          'job_type': 'Full-time',
          'remote_option': false,
          'women_friendly_score': 4.5
        },
        {
          '_id': '2',
          'title': 'Frontend Developer - React',
          'company': 'Swiggy',
          'location': 'Bangalore',
          'experience': '2-4 years',
          'salary_range': '12-20 LPA',
          'skills_required': ['React', 'JavaScript', 'HTML/CSS', 'Redux'],
          'job_url': 'https://careers.swiggy.com/job456',
          'posted_date': '2024-01-14',
          'job_type': 'Full-time',
          'remote_option': true,
          'women_friendly_score': 4.3
        },
        {
          '_id': '3',
          'title': 'Data Scientist',
          'company': 'Zomato',
          'location': 'Delhi',
          'experience': '2-5 years',
          'salary_range': '18-28 LPA',
          'skills_required': ['Python', 'Machine Learning', 'SQL', 'Tableau'],
          'job_url': 'https://www.zomato.com/careers/job789',
          'posted_date': '2024-01-13',
          'job_type': 'Full-time',
          'remote_option': true,
          'women_friendly_score': 4.2
        }
      ]);
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    searchJobs(jobFilters);
  }, [jobFilters, searchJobs]);

  const handleQuickSearch = useCallback((query, location = 'Bangalore') => {
    const newFilters = {
      ...jobFilters,
      query,
      location
    };
    setJobFilters(newFilters);
    searchJobs(newFilters);
  }, [jobFilters, searchJobs]);

  const handleClearChat = useCallback(() => {
    setChatHistory([{
      type: 'assistant',
      message: "Hi there! I'm your AI career assistant. How can I help you today? You can ask me about job searches, resume tips, interview preparation, or companies that are known for supporting women in the Indian workplace."
    }]);
  }, []);

  const handleSuggestedQuery = useCallback((query) => {
    sendMessage(query);
  }, [sendMessage]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false); // Close mobile menu when tab changes
  }, []);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Auth modal handlers
  const handleShowLogin = useCallback(() => {
    setShowLogin(true);
    setShowRegister(false);
    setShowProfile(false);
  }, []);

  const handleShowRegister = useCallback(() => {
    setShowRegister(true);
    setShowLogin(false);
    setShowProfile(false);
  }, []);

  const handleShowProfile = useCallback(() => {
    setShowProfile(true);
    setShowLogin(false);
    setShowRegister(false);
  }, []);

  const handleCloseModals = useCallback(() => {
    setShowLogin(false);
    setShowRegister(false);
    setShowProfile(false);
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setShowRegister(true);
    setShowLogin(false);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setShowLogin(true);
    setShowRegister(false);
  }, []);

  // Hero Section
  const HeroSection = () => (
    <div className="hero">
      <div className="container">
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h1>Your AI Career Assistant</h1>
          <p>
            Welcome to Career Compass! I'm your personal AI assistant specializing in helping women find their 
            ideal jobs across Indian tech hubs. I can help with job searches, resume building, interview preparation, 
            and addressing gender-specific challenges in the Indian workplace.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
              onClick={() => handleTabChange('jobs')}
            >
              🚀 Find Jobs Now
            </button>
            <button 
              className="btn-secondary"
              style={{ 
                fontSize: '1.125rem', 
                padding: '1rem 2rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea'
              }}
              onClick={() => handleTabChange('resume')}
            >
              📝 Build Resume
            </button>
            <button 
              className="btn-secondary"
              style={{ 
                fontSize: '1.125rem', 
                padding: '1rem 2rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea'
              }}
              onClick={() => handleTabChange('salary')}
            >
              💰 Salary Negotiation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Job Search Content
  const JobSearchContent = () => (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '4rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Job Search
          </h2>
          <p style={{ color: '#6b7280' }}>Find your next career opportunity at companies that support women's growth</p>
        </div>
        
        {/* Quick Search Buttons */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: '#4b5563' }}>Quick Search</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {['Python Developer', 'React Developer', 'Data Scientist', 'UX Designer', 'Product Manager'].map((role) => (
              <button
                key={role}
                onClick={() => handleQuickSearch(role)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #667eea',
                  borderRadius: '20px',
                  background: 'white',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#667eea';
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Job Search Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem' }}>Search Filters</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: windowWidth >= 768 ? 'repeat(2, 1fr)' : '1fr', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={jobFilters.query}
                  onChange={(e) => setJobFilters({...jobFilters, query: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
                <input
                  type="text"
                  placeholder="e.g., Bangalore"
                  value={jobFilters.location}
                  onChange={(e) => setJobFilters({...jobFilters, location: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoadingJobs}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {isLoadingJobs ? 'Searching...' : 'Search Jobs'}
            </button>
          </div>
        </div>

        {/* Job Results */}
        {searchPerformed && (
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#4b5563' }}>
              {isLoadingJobs ? 'Loading jobs...' : `Found ${jobResults.length} jobs`}
            </h3>
            
            {isLoadingJobs ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="typing-indicator" style={{ justifyContent: 'center' }}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>Searching for the best opportunities...</p>
              </div>
            ) : jobResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobResults.map((job) => (
                  <div key={job._id || job.job_id} className="card">
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                            {job.job_title || job.title}
                          </h4>
                          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                            <strong>{job.company}</strong> • {job.location}
                          </p>
                          {job.salary_range && (
                            <p style={{ color: '#059669', fontWeight: '500', marginBottom: '0.5rem' }}>
                              💰 {job.salary_range}
                            </p>
                          )}
                          {job.experience && (
                            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                              📅 {job.experience} experience
                            </p>
                          )}
                        </div>
                        {job.women_friendly_score && (
                          <div style={{ 
                            background: '#667eea', 
                            color: 'white', 
                            padding: '0.5rem', 
                            borderRadius: '8px',
                            textAlign: 'center',
                            minWidth: '60px'
                          }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{job.women_friendly_score}</div>
                            <div style={{ fontSize: '0.75rem' }}>Rating</div>
                          </div>
                        )}
                      </div>
                      
                      {job.skills_required && job.skills_required.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {job.skills_required.map((skill, index) => (
                              <span
                                key={index}
                                style={{
                                  background: '#e5e7eb',
                                  color: '#4b5563',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem'
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          Posted {job.posted_date || 'recently'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-secondary"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            onClick={() => {
                              console.log('Save job:', job);
                              alert('Job saved to your favorites!');
                            }}
                          >
                            💾 Save
                          </button>
                          <button
                            className="btn-primary"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            onClick={() => window.open(job.job_url, '_blank')}
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No jobs found matching your criteria.</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      sendMessage("Can you help me find job opportunities?");
                      setActiveTab('home');
                    }}
                  >
                    Ask the AI Assistant for Help
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Home Content
  const HomeContent = () => (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <HeroSection />
      
      <div className="container" style={{ padding: '4rem 0' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: windowWidth >= 1024 ? '2fr 1fr' : '1fr', 
          gap: '2rem' 
        }}>
          <div>
            <ChatInterface 
              chatHistory={chatHistory}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onClearChat={handleClearChat}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SuggestedQueries 
              queries={suggestedQueries}
              onQueryClick={handleSuggestedQuery}
            />
            <SuccessStories />
          </div>
        </div>
      </div>
      
      <FeaturesSection />
    </div>
  );

  // Main Content Router
  const MainContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent />;
      case 'jobs':
        return <JobSearchContent />;
      case 'resume':
        return <ResumeBuilderScreen onBack={() => setActiveTab('home')} />;
      case 'salary':
        return <SalaryNegotiatorScreen onBack={() => setActiveTab('home')} />;
      case 'resources':
      default:
        return (
          <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '4rem 0' }}>
            <div className="container">
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Page
                </h2>
                <p style={{ color: '#6b7280' }}>This section is under development</p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Add CSS for typing indicator
  const styles = `
    .typing-indicator {
      display: flex;
      align-items: center;
      height: 20px;
    }
    
    .typing-indicator span {
      height: 8px;
      width: 8px;
      background-color: #667eea;
      border-radius: 50%;
      display: inline-block;
      margin: 0 2px;
      opacity: 0.6;
      animation: bounce 1.3s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(1) {
      animation-delay: 0s;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.15s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.3s;
    }
    
    @keyframes bounce {
      0%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-8px);
      }
    }
  `;

  return (
    <AuthProvider>
      <style>{styles}</style>
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Header 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          windowWidth={windowWidth}
          isMenuOpen={isMenuOpen}
          onMenuToggle={handleMenuToggle}
          onShowLogin={handleShowLogin}
          onShowRegister={handleShowRegister}
          onShowProfile={handleShowProfile}
        />
        <MainContent />
        
        {/* Auth Modals */}
        {showLogin && (
          <LoginScreen 
            onClose={handleCloseModals}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )}
        
        {showRegister && (
          <RegisterScreen 
            onClose={handleCloseModals}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
        
        {showProfile && (
          <UserProfile onClose={handleCloseModals} />
        )}
      </div>
    </AuthProvider>
  );
};

export default CareerCompass;