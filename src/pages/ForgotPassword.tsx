import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import authBackground from "@/assets/auth-background.jpg";

const emailSchema = z.string().email("Please enter a valid email address");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error: fnError } = await supabase.functions.invoke("send-password-reset", {
        body: { email, redirectUrl },
      });

      if (fnError) {
        throw fnError;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - GoalSync</title>
        <meta name="description" content="Reset your GoalSync password." />
      </Helmet>

      <div
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${authBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background/30" />

        <Link
          to="/auth?mode=signin"
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-background transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-border/50"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">
              Goal<span className="text-primary">Sync</span>
            </span>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground text-sm mb-6">
                If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
              >
                Try another email
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold mb-2">Forgot your password?</h1>
                <p className="text-muted-foreground text-sm">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={`rounded-xl h-11 bg-background/50 ${error ? "border-destructive" : ""}`}
                  />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl h-11 gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Remember your password?{" "}
                <Link to="/auth?mode=signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
