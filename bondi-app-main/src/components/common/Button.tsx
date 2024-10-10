import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonStyles = cva(
  "rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
  {
    variants: {
      intent: {
        primary: "bg-[#1c544e] text-[#f2fbf9] hover:bg-[#164039] focus:ring-[#1c544e]",
        secondary: "bg-[#f2fbf9] text-[#1c544e] border border-[#1c544e] hover:bg-[#e5f4f1] focus:ring-[#1c544e]",
        darkOutline: "bg-transparent text-[#f2fbf9] border border-[#f2fbf9] hover:bg-[#0a2b29] focus:ring-[#f2fbf9]",
        orange: "bg-[#F49C4A] text-[#F2FBF9] hover:bg-[#E08B39] focus:ring-[#F49C4A]", // New orange intent
      },
      size: {
        small: "px-3 py-2 text-sm",
        medium: "px-4 py-2.5 text-base",
        large: "px-6 py-3 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "medium",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  label?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  fullWidth,
  label,
  children,
  ...props
}) => {
  return (
    <button className={buttonStyles({ intent, size, fullWidth, className })} {...props}>
      {children || label}
    </button>
  );
};

export default Button;