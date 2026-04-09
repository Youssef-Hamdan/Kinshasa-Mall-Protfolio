'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  LiquidGlassSurface,
  type LiquidBlurIntensity,
  type LiquidGlowIntensity,
  type LiquidShadowIntensity,
} from '@/components/ui/liquid-glass-surface';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
  expandable?: boolean;
  width?: string;
  height?: string;
  expandedWidth?: string;
  expandedHeight?: string;
  blurIntensity?: LiquidBlurIntensity;
  shadowIntensity?: LiquidShadowIntensity;
  borderRadius?: string;
  glowIntensity?: LiquidGlowIntensity;
  contentClassName?: string;
}

export const LiquidGlassCard = ({
  children,
  className = '',
  draggable = true,
  expandable = false,
  width,
  height,
  expandedWidth,
  expandedHeight,
  blurIntensity = 'xl',
  borderRadius = '32px',
  glowIntensity = 'sm',
  shadowIntensity = 'md',
  contentClassName,
  ...props
}: LiquidGlassCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpansion = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!expandable) return;
    const target = e.target as Element | null;
    if (target?.closest('a, button, input, select, textarea')) return;
    setIsExpanded(!isExpanded);
  };

  const containerVariants = expandable
    ? {
        collapsed: {
          width: width || 'auto',
          height: height || 'auto',
          transition: {
            duration: 0.4,
            ease: [0.5, 1.5, 0.5, 1] as const,
          },
        },
        expanded: {
          width: expandedWidth || 'auto',
          height: expandedHeight || 'auto',
          transition: {
            duration: 0.4,
            ease: [0.5, 1.5, 0.5, 1] as const,
          },
        },
      }
    : undefined;

  const motionProps =
    draggable || expandable
      ? {
          variants: containerVariants,
          animate: expandable
            ? isExpanded
              ? 'expanded'
              : 'collapsed'
            : undefined,
          onClick: expandable ? handleToggleExpansion : undefined,
          drag: draggable,
          dragConstraints: draggable
            ? { left: 0, right: 0, top: 0, bottom: 0 }
            : undefined,
          dragElastic: draggable ? 0.3 : undefined,
          dragTransition: draggable
            ? {
                bounceStiffness: 300,
                bounceDamping: 10,
                power: 0.3,
              }
            : undefined,
          whileDrag: draggable ? { scale: 1.02 } : undefined,
          whileHover: { scale: 1.01 },
          whileTap: { scale: 0.98 },
        }
      : {};

  const innerSurfaceClassName = cn(
    'h-full min-h-0 w-full min-w-0',
    draggable || expandable ? '' : 'relative',
    draggable || expandable ? '' : className
  );

  if (!draggable && !expandable) {
    return (
      <LiquidGlassSurface
        blurIntensity={blurIntensity}
        shadowIntensity={shadowIntensity}
        glowIntensity={glowIntensity}
        borderRadius={borderRadius}
        contentClassName={contentClassName}
        className={innerSurfaceClassName}
      >
        {children}
      </LiquidGlassSurface>
    );
  }

  return (
    <motion.div
      className={cn(
        `relative ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${expandable ? 'cursor-pointer' : ''}`,
        className
      )}
      style={{
        borderRadius,
        ...(width && !expandable && { width }),
        ...(height && !expandable && { height }),
      }}
      {...motionProps}
      {...props}
    >
      <LiquidGlassSurface
        blurIntensity={blurIntensity}
        shadowIntensity={shadowIntensity}
        glowIntensity={glowIntensity}
        borderRadius={borderRadius}
        contentClassName={contentClassName}
        className={cn('h-full min-h-0 w-full min-w-0')}
      >
        {children}
      </LiquidGlassSurface>
    </motion.div>
  );
};

export {
  LiquidGlassSurface,
  liquidGlassBlurClasses,
  liquidGlassGlowStyles,
  liquidGlassShadowStyles,
} from '@/components/ui/liquid-glass-surface';
export { LiquidGlassFilter } from '@/components/ui/liquid-glass-filter';
