import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Check, Star, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "/forever",
    icon: Sparkles,
    features: [
      "Up to 3 active goals",
      "Basic progress tracking",
      "Daily check-ins",
      "Mobile app access",
      "Community support",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    description: "Best for personal growth",
    price: "$9",
    period: "/per month",
    icon: Zap,
    features: [
      "Unlimited goals",
      "Advanced analytics & insights",
      "Goal categories (Health, Career, Life)",
      "Habit streaks & reminders",
      "Priority email support",
      "Export your data",
      "Dark mode",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Team",
    description: "For teams & organizations",
    price: "$29",
    period: "/per user/month",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Team goal sharing",
      "Admin dashboard",
      "Team analytics",
      "SSO & advanced security",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    popular: false,
  },
];

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - GoalSync</title>
        <meta
          name="description"
          content="Simple, transparent pricing. Start free and upgrade when you're ready. All plans include a 14-day free trial."
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
                  Simple, transparent pricing
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4">
                Choose your path to{" "}
                <span className="gradient-text">success</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free and upgrade when you're ready. All plans include a
                14-day free trial with no credit card required.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`relative rounded-3xl p-8 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-xl scale-105"
                      : "bg-card border border-border shadow-card"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-coral text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      plan.popular
                        ? "bg-primary-foreground/20"
                        : "bg-secondary"
                    }`}
                  >
                    <plan.icon
                      className={`w-6 h-6 ${
                        plan.popular ? "text-primary-foreground" : "text-foreground"
                      }`}
                    />
                  </div>

                  <h3 className="text-2xl font-display font-bold mb-1">
                    {plan.name}
                  </h3>
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
                    <span className="text-4xl font-display font-bold">
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
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            plan.popular
                              ? "text-primary-foreground"
                              : "text-primary"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            plan.popular
                              ? "text-primary-foreground/90"
                              : "text-muted-foreground"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={plan.popular ? "secondary" : plan.buttonVariant}
                    className={`w-full rounded-full gap-2 ${
                      plan.popular
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : ""
                    }`}
                  >
                    <Link to="/auth?mode=signup">
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl font-display font-bold mb-4">
                Questions? We've got answers.
              </h2>
              <p className="text-muted-foreground mb-8">
                Need help choosing a plan? Contact us at{" "}
                <a
                  href="mailto:hello@goalsync.app"
                  className="text-primary hover:underline"
                >
                  hello@goalsync.app
                </a>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Cancel anytime
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
