import { motion } from "framer-motion";
import { Heart, Briefcase, Lightbulb } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Health & Fitness",
    description: "Track workouts, nutrition, and wellness.",
    color: "bg-brand-pink/10",
    iconColor: "text-brand-coral",
  },
  {
    icon: Briefcase,
    title: "Career & Growth",
    description: "Boost productivity and achieve your work goals.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Lightbulb,
    title: "Life & Personal",
    description: "Build habits and enrich your daily life.",
    color: "bg-brand-yellow/10",
    iconColor: "text-brand-orange",
  },
];

const FeatureCards = () => {
  return (
    <section className="relative z-10 -mt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-border/50"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
