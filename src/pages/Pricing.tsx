import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Check, X, Star, Sparkles, Crown, ArrowRight, Leaf, TrendingUp, Brain, BarChart3, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";

const plans = [
  {
    name: "Momentum",
    tagline: "Free",
    description: "Build consistency and trust",
    price: "$0",
    period: "/forever",
    icon: Leaf,
    color: "bg-muted",
    iconColor: "text-muted-foreground",
    features: [
      { text: "1 goal category", included: true },
      { text: "Daily tracking", included: true },
      { text: "Basic streaks", included: true },
      { text: "Manual goal setup", included: true },
      { text: "14-day history", included: true },
      { text: "Basic fitness logging", included: true },
      { text: "AI personalization", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Smart reminders", included: false },
      { text: "Predictive insights", included: false },
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
    isCurrent: true,
  },
  {
    name: "Momentum+",
    tagline: "Premium",
    description: "Your personal growth system",
    price: "$9",
    period: "/per month",
    icon: Crown,
    color: "bg-primary",
    iconColor: "text-primary-foreground",
    features: [
      { text: "Unlimited categories", included: true },
      { text: "Daily tracking", included: true },
      { text: "Advanced streaks", included: true },
      { text: "AI-driven goal setup", included: true },
      { text: "Full history (365+ days)", included: true },
      { text: "Advanced fitness tracking", included: true },
      { text: "AI personalization", included: true },
      { text: "Full analytics & insights", included: true },
      { text: "Smart reminders", included: true },
      { text: "Predictive insights", included: true },
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    popular: true,
    isCurrent: false,
  },
];

const premiumBenefits = [
  {
    icon: TrendingUp,
    title: "Unlimited Categories",
    description: "Track personal, professional, and fitness goals all at once",
  },
  {
    icon: Brain,
    title: "AI Personalization",
    description: "Get recommendations tailored to your unique journey",
  },
  {
    icon: BarChart3,
    title: "Full Analytics",
    description: "Deep insights into your progress with long-term trends",
  },
  {
    icon: Calendar,
    title: "Smart Reminders",
    description: "Intelligent notifications at the right time",
  },
  {
    icon: Zap,
    title: "Advanced Fitness",
    description: "Track sets, reps, weight, cardio, and nutrition",
  },
  {
    icon: Sparkles,
    title: "Predictive Insights",
    description: "Know what to focus on before you even ask",
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();

  // Adjust current plan indicator based on actual status
  const adjustedPlans = plans.map((plan) => ({
    ...plan,
    isCurrent: plan.name === "Momentum" ? !isPremium : isPremium,
  }));

  return (
    <>
      <Helmet>
        <title>Pricing - GoalSync</title>
        <meta
          name="description"
          content="Simple pricing with two tiers. Start free with Momentum and upgrade to Momentum+ when you're ready for more."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-secondary rounded-full">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Simple, honest pricing
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4">
                Two tiers.{" "}
                <span className="gradient-text">One mission.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free and build your momentum. Upgrade when you're ready
                for the full experience.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
              {adjustedPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`relative rounded-3xl p-8 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-xl ring-2 ring-primary/20"
                      : "bg-card border border-border shadow-card"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emotion-energy text-white px-4 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </div>
                  )}

                  {plan.isCurrent && user && (
                    <div className="absolute top-4 right-4 bg-background/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </div>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      plan.popular
                        ? "bg-primary-foreground/20"
                        : plan.color
                    }`}
                  >
                    <plan.icon
                      className={`w-7 h-7 ${
                        plan.popular ? "text-primary-foreground" : plan.iconColor
                      }`}
                    />
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-2xl font-display font-bold">
                      {plan.name}
                    </h3>
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full ${
                        plan.popular
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.tagline}
                    </span>
                  </div>
                  <p
                    className={`text-sm mb-6 ${
                      plan.popular
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-5xl font-display font-bold">
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.popular
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              plan.popular
                                ? "text-primary-foreground"
                                : "text-primary"
                            }`}
                          />
                        ) : (
                          <X
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              plan.popular
                                ? "text-primary-foreground/40"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? plan.popular
                                ? "text-primary-foreground/90"
                                : "text-foreground"
                              : plan.popular
                              ? "text-primary-foreground/40"
                              : "text-muted-foreground/40"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={plan.popular ? "secondary" : plan.buttonVariant}
                    className={`w-full rounded-full gap-2 h-12 ${
                      plan.popular
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : ""
                    }`}
                    disabled={plan.isCurrent && user !== null}
                  >
                    <Link to={user ? "#" : "/auth?mode=signup"}>
                      {plan.isCurrent && user ? "Current Plan" : plan.buttonText}
                      {!plan.isCurrent && <ArrowRight className="w-4 h-4" />}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Premium Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto mb-16"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-display font-bold mb-2">
                  What you get with Momentum+
                </h2>
                <p className="text-muted-foreground">
                  Everything you need to become your best self
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {premiumBenefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 rounded-2xl bg-card border border-border"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl font-display font-bold mb-4">
                Questions? We're here.
              </h2>
              <p className="text-muted-foreground mb-8">
                Need help choosing?{" "}
                <a
                  href="mailto:hello@goalsync.app"
                  className="text-primary hover:underline"
                >
                  Reach out to us
                </a>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  No hidden fees
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Secure payments
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Pricing;
