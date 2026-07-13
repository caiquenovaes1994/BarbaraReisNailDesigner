import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/login', { username, password });
      
      onLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Decorative background glow */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="glass-panel p-8 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center gap-1 mb-8 text-primary drop-shadow-md text-center">
          <Sparkles size={32} className="mb-2" />
          <h1 className="text-4xl font-imperial text-white">Bárbara Reis</h1>
          <h2 className="text-2xl font-imperial text-primary">Nail Designer</h2>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          {error && <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">{error}</div>}
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 ml-1">Usuário</label>
            <input 
              type="text" 
              className="glass-input" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 ml-1">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="glass-input w-full pr-10" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary py-3 text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!username || !password}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
