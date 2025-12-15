import { useState, useEffect } from "react";
import { Fingerprint, Eye, EyeOff, Delete, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PinLockScreenProps {
  onUnlock: () => void;
  isSettingUp?: boolean;
  onSetupComplete?: (pin: string) => void;
}

const STORAGE_KEY = "banking_pin";
const ATTEMPTS_KEY = "banking_pin_attempts";
const LOCKOUT_KEY = "banking_lockout_until";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60000; // 1 minute

const PinLockScreen = ({ onUnlock, isSettingUp = false, onSetupComplete }: PinLockScreenProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Check lockout
    const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntil) {
      const remaining = parseInt(lockoutUntil) - Date.now();
      if (remaining > 0) {
        setIsLockedOut(true);
        setLockoutTimeLeft(Math.ceil(remaining / 1000));
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.setItem(ATTEMPTS_KEY, "0");
      }
    }

    // Load attempts
    const savedAttempts = localStorage.getItem(ATTEMPTS_KEY);
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
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.setItem(ATTEMPTS_KEY, "0");
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLockedOut, lockoutTimeLeft]);

  const handleDigit = (digit: string) => {
    if (isLockedOut) return;
    
    setError("");
    if (step === "enter" && pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (isSettingUp) {
          setTimeout(() => {
            setStep("confirm");
            setPin("");
            setConfirmPin(newPin);
          }, 200);
        } else {
          // Verify PIN
          const savedPin = localStorage.getItem(STORAGE_KEY);
          if (newPin === savedPin) {
            localStorage.setItem(ATTEMPTS_KEY, "0");
            onUnlock();
          } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());
            
            if (newAttempts >= MAX_ATTEMPTS) {
              const lockoutUntil = Date.now() + LOCKOUT_DURATION;
              localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
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
    } else if (step === "confirm" && pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin === confirmPin) {
          localStorage.setItem(STORAGE_KEY, newPin);
          toast({ title: "PIN установлен", description: "Теперь вы можете входить по PIN-коду" });
          onSetupComplete?.(newPin);
        } else {
          setError("PIN-коды не совпадают");
          setTimeout(() => {
            setPin("");
            setStep("enter");
            setConfirmPin("");
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError("");
    }
  };

  const handleBiometric = () => {
    // Simulate biometric authentication
    toast({ title: "Биометрия", description: "Touch ID / Face ID подтверждён" });
    onUnlock();
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-8">
        <span className="text-3xl font-bold text-primary-foreground">T</span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-foreground mb-2">
        {isLockedOut 
          ? "Приложение заблокировано" 
          : isSettingUp 
            ? (step === "enter" ? "Придумайте PIN-код" : "Повторите PIN-код")
            : "Введите PIN-код"
        }
      </h1>

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
            <p className="text-destructive text-sm mb-4 animate-shake">{error}</p>
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
                    className="w-16 h-16 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Delete className="w-6 h-6 text-foreground" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDigit(digit)}
                    className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-foreground hover:bg-muted/80 transition-colors active:scale-95"
                  >
                    {digit}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Biometric */}
          {!isSettingUp && (
            <button
              onClick={handleBiometric}
              className="mt-8 flex flex-col items-center gap-2 text-primary"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-8 h-8" />
              </div>
              <span className="text-sm">Touch ID / Face ID</span>
            </button>
          )}
        </>
      )}

      {/* Reset PIN (for demo) */}
      {!isSettingUp && (
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            localStorage.removeItem(LOCKOUT_KEY);
            window.location.reload();
          }}
          className="absolute bottom-8 text-xs text-muted-foreground underline"
        >
          Сбросить PIN (для демо)
        </button>
      )}
    </div>
  );
};

export default PinLockScreen;
