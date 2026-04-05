import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {THEME} from '../data/theme';
import {SlideLayout} from './SlideLayout';

interface BulletSlideProps {
  title: string;
  bullets: string[];
  accentColor?: string;
  globalFrame: number;
  slideNumber: number;
  totalSlides: number;
}

export const BulletSlide: React.FC<BulletSlideProps> = ({
  title,
  bullets,
  accentColor = THEME.colors.primary,
  globalFrame,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <SlideLayout
      globalFrame={globalFrame}
      slideNumber={slideNumber}
      totalSlides={totalSlides}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          fontSize: THEME.fontSize.heading,
          fontWeight: 700,
          color: THEME.colors.text,
          fontFamily: THEME.fonts.heading,
          marginBottom: THEME.spacing.section,
          borderLeft: `4px solid ${accentColor}`,
          paddingLeft: 20,
        }}
      >
        {title}
      </div>

      {/* Bullets */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
        {bullets.map((bullet, i) => {
          const delay = 15 + i * 12;
          const bulletOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateRight: 'clamp',
          });
          const bulletX = interpolate(frame, [delay, delay + 15], [40, 0], {
            extrapolateRight: 'clamp',
          });
          const dotScale = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: {damping: 10, mass: 0.5},
          });

          return (
            <div
              key={i}
              style={{
                opacity: bulletOpacity,
                transform: `translateX(${bulletX}px)`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                  marginTop: 14,
                  flexShrink: 0,
                  transform: `scale(${dotScale})`,
                }}
              />
              <div
                style={{
                  fontSize: THEME.fontSize.body,
                  color: THEME.colors.text,
                  fontFamily: THEME.fonts.body,
                  lineHeight: 1.5,
                }}
              >
                {bullet}
              </div>
            </div>
          );
        })}
      </div>
    </SlideLayout>
  );
};
