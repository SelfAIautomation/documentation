import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {THEME} from '../data/theme';
import {SlideLayout} from './SlideLayout';

interface QuoteSlideProps {
  quote: string;
  author?: string;
  title?: string;
  accentColor?: string;
  slideId?: string;
  globalFrame: number;
  slideNumber: number;
  totalSlides: number;
}

export const QuoteSlide: React.FC<QuoteSlideProps> = ({
  quote,
  author,
  title,
  accentColor = THEME.colors.primary,
  slideId,
  globalFrame,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const quoteMarkScale = spring({frame, fps, config: {damping: 14, mass: 0.9}});
  const quoteOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const quoteY = interpolate(frame, [8, 20], [20, 0], {
    extrapolateRight: 'clamp',
  });
  const authorOpacity = interpolate(frame, [18, 28], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const lineWidth = interpolate(frame, [3, 18], [0, 80], {
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <SlideLayout
      globalFrame={globalFrame}
      slideId={slideId}
      slideNumber={slideNumber}
      totalSlides={totalSlides}
    >
      {/* Optional label */}
      {title && (
        <div
          style={{
            opacity: titleOpacity,
            fontSize: THEME.fontSize.small,
            color: accentColor,
            fontFamily: THEME.fonts.body,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            marginBottom: 40,
          }}
        >
          {title}
        </div>
      )}

      {/* Opening quotation mark */}
      <div
        style={{
          fontSize: 200,
          lineHeight: 0.8,
          color: `${accentColor}20`,
          fontFamily: THEME.fonts.heading,
          fontWeight: 900,
          transform: `scale(${quoteMarkScale})`,
          transformOrigin: 'left center',
          marginBottom: -20,
          userSelect: 'none' as const,
        }}
      >
        &#8220;
      </div>

      {/* Quote text */}
      <div
        style={{
          opacity: quoteOpacity,
          transform: `translateY(${quoteY}px)`,
          fontSize: THEME.fontSize.heading,
          fontWeight: 500,
          color: THEME.colors.text,
          fontFamily: THEME.fonts.body,
          lineHeight: 1.6,
          paddingLeft: 24,
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        {quote}
      </div>

      {/* Author divider & name */}
      {author && (
        <div
          style={{
            opacity: authorOpacity,
            marginTop: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: lineWidth,
              height: 2,
              backgroundColor: accentColor,
              borderRadius: 1,
            }}
          />
          <div
            style={{
              fontSize: THEME.fontSize.body,
              color: THEME.colors.textSecondary,
              fontFamily: THEME.fonts.body,
              fontStyle: 'italic' as const,
            }}
          >
            {author}
          </div>
        </div>
      )}
    </SlideLayout>
  );
};
