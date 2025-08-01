
'use client';
import * as React from "react"
import { useModules } from "@/context/modules-context";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  const { companyProfile } = useModules();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const companyName = isClient && companyProfile?.companyName ? companyProfile.companyName : 'BizView';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      aria-label={`${companyName} logo`}
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="24"
        fontFamily="'PT Sans', sans-serif"
        fontWeight="bold"
        fill="url(#grad1)"
      >
        {companyName}
      </text>
    </svg>
  );
}
