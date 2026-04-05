import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {THEME} from '../data/theme';
import {TOTAL_FRAMES} from '../data/scenes';

interface ProgressBarProps {
  globalFrame: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({globalFrame}) => {
  const frame = useCurrentFrame();
  const progress = (globalFrame + frame) / TOTAL_FRAMES;

  const barWidth = interpolate(progress, [0, 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: THEME.colors.surface,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${THEME.colors.primary}, ${THEME.colors.accent})`,
          borderRadius: '0 3px 3px 0',
        }}
      />
    </div>
  );
};
