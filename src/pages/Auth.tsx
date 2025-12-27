import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import { z } from "zod";
import authBackground from "@/assets/auth-background.jpg";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, signUp, signIn, signInWithGoogle } = useAuth();
  const { isCompleted, loading: onboardingLoading } = useOnboarding();

  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsSignUp(mode !== "signin");
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !onboardingLoading && user) {
      if (isCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, authLoading, onboardingLoading, isCompleted, navigate]);

  const validateForm = () => {
    setErrors({});
    try {
      if (isSignUp) {
        signUpSchema.parse(formData);
      } else {
        signInSchema.parse(formData);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Account created successfully! Let's set up your goals.");
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isSignUp ? "Create Account" : "Sign In"} - GoalSync</title>
        <meta
          name="description"
          content={
            isSignUp
              ? "Create your GoalSync account and start achieving your goals today."
              : "Sign in to your GoalSync account."
          }
        />
      </Helmet>

      <div
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${authBackground})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background/30" />

        {/* Back to Home */}
        <Link
          to="/"
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-background transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-border/50"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">
              Goal<span className="text-primary">Sync</span>
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold mb-2">
              {isSignUp ? "Start building the life you want." : "Welcome back — let's continue your journey."}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp
                ? "Set goals that matter — personal, professional, and fitness."
                : "Sign in to continue your journey"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`rounded-xl h-11 bg-background/50 ${errors.fullName ? "border-destructive" : ""}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`rounded-xl h-11 bg-background/50 ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`rounded-xl h-11 bg-background/50 pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`rounded-xl h-11 bg-background/50 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full rounded-xl h-11 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {isSignUp && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              You can update your goals anytime.
            </p>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button 
            variant="outline" 
            className="w-full rounded-xl h-11 gap-2"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
              }}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </p>
        </motion.div>

        {/* Footer Text */}
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-foreground/70 text-center">
          Track personal, professional & fitness goals in one place.
        </p>
      </div>
    </>
  );
};

export default Auth;
