import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {THEME} from '../data/theme';
import {Background} from './Background';
import {ProgressBar} from './ProgressBar';

interface SlideLayoutProps {
  children: React.ReactNode;
  globalFrame: number;
  slideNumber?: number;
  totalSlides?: number;
}

export const SlideLayout: React.FC<SlideLayoutProps> = ({
  children,
  globalFrame,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          opacity: fadeIn,
          padding: THEME.spacing.page,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </AbsoluteFill>
      {slideNumber !== undefined && totalSlides !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: THEME.spacing.page,
            color: THEME.colors.textMuted,
            fontSize: THEME.fontSize.label,
            fontFamily: THEME.fonts.body,
          }}
        >
          {slideNumber} / {totalSlides}
        </div>
      )}
      <ProgressBar globalFrame={globalFrame} />
    </AbsoluteFill>
  );
};
