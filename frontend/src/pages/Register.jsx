import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // new loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // start loading

    try {
      const res = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // Auto login after registration
      login(res.data.data.user, res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.errors?.email ||
        err.response?.data?.errors?.password ||
        err.response?.data?.message ||
        'Registration failed'
      );
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card title="Create Account" error={error}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          <Input label="Confirm Password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} placeholder="********" />
          <Button type="submit" fullWidth>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </Button>
        </form>
        <p className="text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </Card>
    </div>
  );
}
