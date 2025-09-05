import React from "react";

const StripeSLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect x="2" y="2" width="28" height="28" rx="6" fill="#635BFF" />
        <text
            x="16"
            y="21"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="bold"
            fontSize="18"
            fill="#fff"
            dominantBaseline="middle"
        >
            S
        </text>
    </svg>
);

export default StripeSLogo;
