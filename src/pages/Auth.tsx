import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Fingerprint, AlertCircle, ScanFace } from "lucide-react";
import RSHBLogo from "@/components/banking/RSHBLogo";
import { Capacitor } from "@capacitor/core";

const DEMO_EMAIL = "egor.kotikov@demo.bank";
const DEMO_PASSWORD = "demo123456";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometryFailed, setBiometryFailed] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    let { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);

    if (error?.message?.includes("Invalid login credentials")) {
      const signUpResult = await signUp(DEMO_EMAIL, DEMO_PASSWORD, "EGOR KOTIKOV");
      if (signUpResult.error) {
        const retryResult = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
        error = retryResult.error;
      } else {
        error = null;
      }
    }

    setIsLoading(false);

    if (error) {
      setError("Не удалось войти в систему");
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
  }, [isLoading, signIn, signUp, toast]);

  const attemptBiometric = useCallback(async () => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      try {
        const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
        const result = await BiometricAuth.checkBiometry();
        
        if (result.isAvailable) {
          await BiometricAuth.authenticate({
            reason: "Войдите в Россельхозбанк",
            cancelTitle: "Отмена",
          });
          // Auth succeeded
          await handleLogin();
        } else {
          // No biometry available on device, auto-login
          await handleLogin();
        }
      } catch (e: any) {
        // User cancelled or biometry failed
        setBiometryFailed(true);
        setError("Биометрическая аутентификация отменена");
      }
    } else {
      // Web: just login directly (simulating Face ID)
      await handleLogin();
    }
  }, [handleLogin]);

  // Auto-trigger biometric on mount
  useEffect(() => {
    if (!authLoading && !user) {
      attemptBiometric();
    }
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <RSHBLogo className="w-20 h-20 mb-8" />

      {/* Title */}
      <h1 className="text-xl font-bold text-foreground mb-2">
        {isLoading ? "Вход..." : "Россельхозбанк"}
      </h1>

      <p className="text-muted-foreground mb-8">EGOR KOTIKOV</p>

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Авторизация...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* Face ID icon */}
          <button
            onClick={attemptBiometric}
            className="flex flex-col items-center gap-3 text-primary"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ScanFace className="w-12 h-12" />
            </div>
            <span className="text-sm font-medium">Войти с Face ID</span>
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Retry button if failed */}
          {biometryFailed && (
            <button
              onClick={() => {
                setBiometryFailed(false);
                setError("");
                attemptBiometric();
              }}
              className="text-sm text-primary underline"
            >
              Попробовать снова
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Auth;
