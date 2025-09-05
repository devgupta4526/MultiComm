import React from 'react';

const GoogleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            background: '#fff',
            boxShadow: '0 1px 2px rgba(60,64,67,.3)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '16px',
            color: '#3c4043',
        }}
        {...props}
    >
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
            style={{ marginRight: '8px' }}
        >
            <g>
                <path
                    d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.41c-.23 1.23-.93 2.27-1.98 2.97v2.47h3.2c1.87-1.72 2.97-4.26 2.97-7.23z"
                    fill="#4285F4"
                />
                <path
                    d="M10 20c2.7 0 4.97-.9 6.63-2.44l-3.2-2.47c-.89.6-2.02.96-3.43.96-2.64 0-4.88-1.78-5.68-4.18H1.03v2.62C2.77 17.98 6.13 20 10 20z"
                    fill="#34A853"
                />
                <path
                    d="M4.32 12.87c-.2-.6-.32-1.24-.32-1.87s.12-1.27.32-1.87V6.51H1.03A9.97 9.97 0 0 0 0 10c0 1.64.4 3.19 1.03 4.49l3.29-2.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M10 3.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87C14.97 1.09 12.7 0 10 0 6.13 0 2.77 2.02 1.03 5.51l3.29 2.62C5.12 5.74 7.36 3.96 10 3.96z"
                    fill="#EA4335"
                />
            </g>
        </svg>
        Continue with Google
    </button>
);

export default GoogleButton;