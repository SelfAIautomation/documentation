import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {THEME} from '../data/theme';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gradientAngle = interpolate(frame, [0, 9000], [135, 225], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${THEME.colors.background} 0%, #1a1a2e 50%, ${THEME.colors.background} 100%)`,
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${THEME.colors.border}22 1px, transparent 1px),
            linear-gradient(90deg, ${THEME.colors.border}22 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </AbsoluteFill>
  );
};
