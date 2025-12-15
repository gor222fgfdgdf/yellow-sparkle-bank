import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Delete, Fingerprint, Eye, EyeOff, AlertCircle } from "lucide-react";

const DEMO_EMAIL = "egor.kotikov@demo.bank";
const DEMO_PASSWORD = "demo123456";
const CORRECT_PIN = "1234";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60000;

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const lockoutUntil = localStorage.getItem("auth_lockout_until");
    if (lockoutUntil) {
      const remaining = parseInt(lockoutUntil) - Date.now();
      if (remaining > 0) {
        setIsLockedOut(true);
        setLockoutTimeLeft(Math.ceil(remaining / 1000));
      } else {
        localStorage.removeItem("auth_lockout_until");
        localStorage.setItem("auth_attempts", "0");
      }
    }
    const savedAttempts = localStorage.getItem("auth_attempts");
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  useEffect(() => {
    if (isLockedOut && lockoutTimeLeft > 0) {
      const timer = setInterval(() => {
        setLockoutTimeLeft(prev => {
          if (prev <= 1) {
            setIsLockedOut(false);
            localStorage.removeItem("auth_lockout_until");
            localStorage.setItem("auth_attempts", "0");
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLockedOut, lockoutTimeLeft]);

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Try to sign in first
    let { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    
    // If user doesn't exist, create them
    if (error?.message?.includes("Invalid login credentials")) {
      const signUpResult = await signUp(DEMO_EMAIL, DEMO_PASSWORD, "EGOR KOTIKOV");
      if (signUpResult.error) {
        // If already exists, try signin again
        const retryResult = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
        error = retryResult.error;
      } else {
        error = null;
      }
    }
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Ошибка входа",
        description: "Не удалось войти в систему",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Добро пожаловать!",
        description: "EGOR KOTIKOV",
      });
    }
  };

  const handleDigit = async (digit: string) => {
    if (isLockedOut || isLoading) return;
    
    setError("");
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin === CORRECT_PIN) {
          localStorage.setItem("auth_attempts", "0");
          await handleLogin();
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          localStorage.setItem("auth_attempts", newAttempts.toString());
          
          if (newAttempts >= MAX_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_DURATION;
            localStorage.setItem("auth_lockout_until", lockoutUntil.toString());
            setIsLockedOut(true);
            setLockoutTimeLeft(Math.ceil(LOCKOUT_DURATION / 1000));
            setError("Слишком много попыток");
          } else {
            setError(`Неверный PIN. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`);
          }
          
          setTimeout(() => setPin(""), 300);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isLoading) {
      setPin(pin.slice(0, -1));
      setError("");
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-8">
        <span className="text-3xl font-bold text-primary-foreground">T</span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-foreground mb-2">
        {isLockedOut ? "Приложение заблокировано" : "Введите PIN-код"}
      </h1>
      
      <p className="text-muted-foreground mb-6">EGOR KOTIKOV</p>

      {isLockedOut ? (
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Попробуйте снова через</p>
          <p className="text-2xl font-bold text-foreground">{lockoutTimeLeft} сек</p>
        </div>
      ) : (
        <>
          {/* PIN Dots */}
          <div className="flex gap-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length 
                    ? error ? "bg-destructive" : "bg-primary" 
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-destructive text-sm mb-4">{error}</p>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Вход...</span>
            </div>
          )}

          {/* Show PIN Toggle */}
          <button
            onClick={() => setShowPin(!showPin)}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPin ? "Скрыть" : "Показать"}
          </button>

          {showPin && pin && (
            <p className="text-2xl font-mono font-bold text-foreground mb-4 tracking-widest">
              {pin}
            </p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4 max-w-xs">
            {digits.map((digit, i) => (
              <div key={i} className="flex items-center justify-center">
                {digit === "" ? (
                  <div className="w-16 h-16" />
                ) : digit === "delete" ? (
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    <Delete className="w-6 h-6 text-foreground" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDigit(digit)}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-foreground hover:bg-muted/80 transition-colors active:scale-95 disabled:opacity-50"
                  >
                    {digit}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Biometric */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="mt-8 flex flex-col items-center gap-2 text-primary disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Fingerprint className="w-8 h-8" />
            </div>
            <span className="text-sm">Touch ID / Face ID</span>
          </button>
        </>
      )}

      {/* Hint */}
      <p className="absolute bottom-8 text-xs text-muted-foreground">
        PIN-код: 1234
      </p>
    </div>
  );
};

export default Auth;
