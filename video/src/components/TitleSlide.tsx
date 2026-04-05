import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {THEME} from '../data/theme';
import {Background} from './Background';
import {ProgressBar} from './ProgressBar';

interface TitleSlideProps {
  title: string;
  subtitle?: string;
  globalFrame: number;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({
  title,
  subtitle,
  globalFrame,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleScale = spring({frame, fps, config: {damping: 15, mass: 0.8}});
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [20, 45], [30, 0], {
    extrapolateRight: 'clamp',
  });

  const lines = title.split('\n');

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: THEME.spacing.page,
        }}
      >
        {/* Accent line */}
        <div
          style={{
            width: interpolate(frame, [0, 30], [0, 120], {
              extrapolateRight: 'clamp',
            }),
            height: 4,
            background: `linear-gradient(90deg, ${THEME.colors.primary}, ${THEME.colors.accent})`,
            marginBottom: 40,
            borderRadius: 2,
          }}
        />
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: 'center',
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: THEME.fontSize.title,
                fontWeight: 900,
                color: THEME.colors.text,
                fontFamily: THEME.fonts.heading,
                lineHeight: 1.3,
              }}
            >
              {line}
            </div>
          ))}
        </div>
        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              fontSize: THEME.fontSize.subtitle,
              color: THEME.colors.textSecondary,
              fontFamily: THEME.fonts.body,
              marginTop: 30,
              textAlign: 'center',
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>
      <ProgressBar globalFrame={globalFrame} />
    </AbsoluteFill>
  );
};
