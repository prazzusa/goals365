import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import DemoSection from "@/components/DemoSection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>GoalSync - One App, All Your Goals</title>
        <meta
          name="description"
          content="Achieve personal, professional, and fitness goals in one place. Track your progress, build habits, and reach your full potential with GoalSync."
        />
        <meta name="keywords" content="goal tracking, habit tracker, productivity, fitness goals, personal goals" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <FeatureCards />
          <DemoSection />
        </main>
      </div>
    </>
  );
};

export default Index;
