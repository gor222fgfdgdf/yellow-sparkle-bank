import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, ScanFace, LogIn } from "lucide-react";
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
  const loginAttempted = useRef(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
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
    } catch (e) {
      setError("Ошибка соединения с сервером");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, signIn, signUp, toast]);

  const attemptBiometric = useCallback(async () => {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    console.log("[Auth] Platform:", platform, "isNative:", isNative);

    // Detect native context by platform OR user agent fallback
    const isCapacitorApp = isNative || navigator.userAgent.includes("CapacitorApp");
    console.log("[Auth] isCapacitorApp:", isCapacitorApp);

    if (isCapacitorApp) {
      try {
        const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
        console.log("[Auth] BiometricAuth imported successfully");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("timeout")), 5000)
        );
        
        const result = await Promise.race([
          BiometricAuth.checkBiometry(),
          timeoutPromise,
        ]) as any;
        
        console.log("[Auth] checkBiometry result:", JSON.stringify(result));
        
        if (result?.isAvailable) {
          console.log("[Auth] Biometry available, requesting authentication...");
          await Promise.race([
            BiometricAuth.authenticate({
              reason: "Войдите в Россельхозбанк",
              cancelTitle: "Отмена",
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 10000)),
          ]);
          console.log("[Auth] Biometric auth success");
          await handleLogin();
        } else {
          console.log("[Auth] Biometry NOT available, falling back to login");
          await handleLogin();
        }
      } catch (e: any) {
        console.log("[Auth] Biometric error:", e?.message, e);
        setBiometryFailed(true);
        if (e?.message === "timeout") {
          setError("Face ID недоступен, войдите вручную");
        } else {
          setError("Face ID отменён");
        }
      }
    } else {
      console.log("[Auth] Not native, direct login");
      await handleLogin();
    }
  }, [handleLogin]);

  // Auto-trigger biometric on mount (once)
  useEffect(() => {
    if (!authLoading && !user && !loginAttempted.current) {
      loginAttempted.current = true;
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
      <RSHBLogo className="w-20 h-20 mb-8" />

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
          {/* Face ID button */}
          <button
            onClick={attemptBiometric}
            className="flex flex-col items-center gap-3 text-primary active:opacity-70 touch-manipulation"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ScanFace className="w-12 h-12" />
            </div>
            <span className="text-sm font-medium">Войти с Face ID</span>
          </button>

          {/* Direct login button - always visible */}
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 text-primary text-sm font-medium py-3 px-6 rounded-full bg-primary/10 active:opacity-70 touch-manipulation"
          >
            <LogIn className="w-4 h-4" />
            <span>Войти без Face ID</span>
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Auth;
