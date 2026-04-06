import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {THEME} from '../data/theme';
import {AVAILABLE_IMAGES} from '../data/image-manifest';
import {Background} from './Background';
import {ProgressBar} from './ProgressBar';

const imageSet = new Set(AVAILABLE_IMAGES);

interface SlideLayoutProps {
  children: React.ReactNode;
  globalFrame: number;
  slideId?: string;
  slideNumber?: number;
  totalSlides?: number;
}

export const SlideLayout: React.FC<SlideLayoutProps> = ({
  children,
  globalFrame,
  slideId,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const hasImage = slideId && imageSet.has(slideId);

  return (
    <AbsoluteFill>
      {hasImage ? (
        <>
          <Img
            src={staticFile(`images/${slideId}.png`)}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Dark overlay for text readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
            }}
          />
        </>
      ) : (
        <Background />
      )}
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
