// This layout has been deactivated to resolve a routing conflict.
import React from 'react';

// This component is intentionally not exported as default to avoid being an active layout.
function DeactivatedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
