import React from 'react';

type Props = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
};

const ProfileIcon: React.FC<Props> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.5,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    {/* Head */}
    <circle
      cx="12"
      cy="8"
      r="4.75"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Shoulders/chest */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.00002 19.2014C3.65163 16.8655 6.5337 15.0739 12 15.0739C17.4663 15.0739 20.3484 16.8655 21.9999 19.2014"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ProfileIcon;
