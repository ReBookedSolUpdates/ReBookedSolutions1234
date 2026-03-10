import React from "react";

interface BankingRequirementCheckProps {
  onCanProceed: (canProceed: boolean) => void;
  children?: React.ReactNode;
}

/**
 * BankingRequirementCheck is now a pass-through component as CreateListing 
 * handles its own address/locker validation logic directly.
 */
const BankingRequirementCheck: React.FC<BankingRequirementCheckProps> = ({
  onCanProceed,
  children,
}) => {
  // Ensure we signal that we can proceed to allow the parent (CreateListing) 
  // to handle the actual logic and UI for locker selection
  React.useEffect(() => {
    onCanProceed(true);
  }, [onCanProceed]);

  return <>{children}</>;
};

export default BankingRequirementCheck;
