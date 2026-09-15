import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Sparkles, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import packageInfo from '../../package.json';

const motivationalMessages = [
  "A beleza que você cria hoje ilumina o sorriso de alguém amanhã! 💅✨",
  "Transformando cuidado em arte! Mais um dia para brilhar. 🌟",
  "Atenção aos detalhes é o que torna seu trabalho inesquecível. 💖",
  "Você é a especialista que transforma! Suas técnicas fazem mãos ainda mais bonitas. 🪄",
  "O seu talento faz toda a diferença! Entregue resultados elegantes. 🎀",
  "O momento de beleza da sua cliente começa aqui! 🌸",
  "Enaltecendo a confiança feminina! Seu trabalho faz cada mulher mais poderosa. 👑",
  "A excelência está em suas mãos! Leve alegria em cada atendimento. 🦋",
  "Sorrisos começam com unhas bem feitas! 🎨",
  "Construa mais um dia de sucesso e clientes apaixonadas. 🥂"
];

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [instagramFeed, setInstagramFeed] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Fetch Instagram Feed
  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        const response = await api.get('/instagram/feed');
        if (response.data && response.data.success && response.data.data.length > 0) {
          setInstagramFeed(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch Instagram feed', err);
      }
    };
    fetchInstagramFeed();
  }, []);

  // Motivational Messages Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Instagram Slideshow Interval
  useEffect(() => {
    if (instagramFeed.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % instagramFeed.length);
    }, 6000); // Muda a cada 6 segundos
    return () => clearInterval(interval);
  }, [instagramFeed]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const currentUsername = username;
    const currentPassword = password;

    try {
      await api.post('/login', { username: currentUsername, password: currentPassword });
      
      setIsSuccess(true);
      setTimeout(() => {
        onLogin();
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setPassword(''); // Limpa a senha se der erro
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      
      {/* Background Slideshow (Instagram Feed) */}
      {instagramFeed.length > 0 && (
        <div className="absolute inset-0 z-0">
          {instagramFeed.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt="Nail art background"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {/* Dark Overlay for better contrast and readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </div>
      )}

      {/* Decorative background glow (fallback se não houver feed ou se demorar) */}
      {instagramFeed.length === 0 && (
        <>
          <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </>
      )}
      
      {/* Login Box */}
      <div className={`glass-panel p-8 w-full max-w-md relative z-10 transition-all duration-500 ${isSuccess ? 'opacity-0 scale-95 delay-500' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-1 mb-6 text-primary drop-shadow-md text-center">
          <Sparkles size={32} className="mb-2 text-white" />
          <h1 className="text-4xl font-imperial text-white drop-shadow-lg">Bárbara Reis</h1>
          <h2 className="text-2xl font-imperial text-primary drop-shadow-lg">Nail Designer</h2>
        </div>

        <div className="h-16 flex items-center justify-center mb-6 text-center px-4">
          <p key={msgIndex} className="text-sm italic text-gray-200 animate-fade-msg font-medium drop-shadow-md">
            "{motivationalMessages[msgIndex]}"
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/20 py-2 rounded-lg animate-in fade-in zoom-in duration-300 font-medium backdrop-blur-md">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300 ml-1 font-medium drop-shadow-md">Usuário</label>
            <input 
              type="text" 
              className="glass-input bg-black/30 placeholder-gray-400" 
              required 
              autoComplete="username"
              value={username}
              onChange={e => { setUsername(e.target.value); if(error) setError(''); }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300 ml-1 font-medium drop-shadow-md">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="glass-input bg-black/30 w-full pr-10 placeholder-gray-400" 
                required 
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); if(error) setError(''); }}
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
            className={`py-3 text-lg mt-2 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${isSuccess ? 'bg-green-500 text-white scale-105 shadow-lg shadow-green-500/50' : error ? 'bg-red-500/80 text-white border border-red-500 shadow-lg shadow-red-500/30' : 'btn-primary'} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!username || !password || isSuccess}
          >
            {isSuccess ? (
              <>
                <Unlock size={22} className="animate-bounce" />
                Acesso Liberado!
              </>
            ) : error ? (
              <>
                <Lock size={22} className="animate-pulse" />
                Falha no Login
              </>
            ) : 'Entrar'}
          </button>
          
          <div className="text-center mt-1">
            <span className="text-xs text-white/60 font-medium drop-shadow-md">v{packageInfo.version}</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

