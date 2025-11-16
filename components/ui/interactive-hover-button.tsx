import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, showIcon = true, icon, onClick, ...props }, ref) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 600);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-full border bg-background px-6 py-2 text-center font-semibold transition-all",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span className={cn(
        "inline-block translate-x-0 transition-all duration-300",
        isPressed && "translate-x-12 opacity-0"
      )}>
        {text}
      </span>
      <div className={cn(
        "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300",
        isPressed && "-translate-x-0 opacity-100"
      )}>
        <span>{text}</span>
        {showIcon && (icon || <ArrowRight />)}
      </div>
      <div className={cn(
        "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300",
        isPressed && "left-[0%] top-[0%] h-full w-full scale-[1.8]"
      )}></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
