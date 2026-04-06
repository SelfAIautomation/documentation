import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {THEME} from '../data/theme';
import {AVAILABLE_IMAGES} from '../data/image-manifest';
import {Background} from './Background';
import {ProgressBar} from './ProgressBar';

const imageSet = new Set(AVAILABLE_IMAGES);

interface TitleSlideProps {
  title: string;
  subtitle?: string;
  slideId?: string;
  globalFrame: number;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({
  title,
  subtitle,
  slideId,
  globalFrame,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleScale = spring({frame, fps, config: {damping: 15, mass: 0.8}});
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [10, 22], [20, 0], {
    extrapolateRight: 'clamp',
  });

  const lines = title.split('\n');

  return (
    <AbsoluteFill>
      {slideId && imageSet.has(slideId) ? (
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
            width: interpolate(frame, [0, 18], [0, 120], {
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
