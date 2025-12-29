import { ReactNode, useState } from "react";
import { Lock } from "lucide-react";
import { usePremium, TierLimits } from "@/hooks/usePremium";
import { UpsellPrompt } from "./UpsellPrompt";

interface FeatureGateProps {
  feature: keyof TierLimits;
  children: ReactNode;
  fallback?: ReactNode;
  context?: "category" | "analytics" | "fitness" | "insights" | "general";
  showLockOverlay?: boolean;
}

export const FeatureGate = ({
  feature,
  children,
  fallback,
  context = "general",
  showLockOverlay = true,
}: FeatureGateProps) => {
  const { canAccessFeature, isPremium, loading } = usePremium();
  const [showUpsell, setShowUpsell] = useState(false);

  if (loading) {
    return <div className="animate-pulse bg-muted rounded-lg h-20" />;
  }

  const hasAccess = canAccessFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLockOverlay) {
    return (
      <>
        <div
          onClick={() => setShowUpsell(true)}
          className="relative cursor-pointer group"
        >
          <div className="opacity-50 pointer-events-none blur-[1px]">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl border border-primary/20 transition-all group-hover:bg-background/70">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Premium Feature
              </p>
              <p className="text-xs text-muted-foreground">
                Tap to learn more
              </p>
            </div>
          </div>
        </div>
        <UpsellPrompt
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
          context={context}
        />
      </>
    );
  }

  return null;
};
