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

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  sectionNumber: number;
  accentColor?: string;
  globalFrame: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  sectionNumber,
  accentColor = THEME.colors.primary,
  globalFrame,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const numberScale = spring({frame, fps, config: {damping: 12}});
  const lineWidth = interpolate(frame, [10, 40], [0, 300], {
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleX = interpolate(frame, [15, 35], [-40, 0], {
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
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
          padding: THEME.spacing.page * 1.5,
        }}
      >
        {/* Section number */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: `${accentColor}30`,
            fontFamily: THEME.fonts.heading,
            transform: `scale(${numberScale})`,
            lineHeight: 1,
            marginBottom: -20,
          }}
        >
          {String(sectionNumber).padStart(2, '0')}
        </div>
        {/* Accent line */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: accentColor,
            marginBottom: 30,
            borderRadius: 2,
          }}
        />
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateX(${titleX}px)`,
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: THEME.fontSize.sectionTitle,
                fontWeight: 700,
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
              fontSize: THEME.fontSize.subtitle,
              color: THEME.colors.textSecondary,
              fontFamily: THEME.fonts.body,
              marginTop: 16,
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
