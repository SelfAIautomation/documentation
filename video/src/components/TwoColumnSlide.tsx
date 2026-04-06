import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {THEME} from '../data/theme';
import {SlideLayout} from './SlideLayout';

interface ColumnData {
  heading: string;
  items: string[];
}

interface TwoColumnSlideProps {
  title: string;
  leftColumn: ColumnData;
  rightColumn: ColumnData;
  accentColor?: string;
  slideId?: string;
  globalFrame: number;
  slideNumber: number;
  totalSlides: number;
}

export const TwoColumnSlide: React.FC<TwoColumnSlideProps> = ({
  title,
  leftColumn,
  rightColumn,
  accentColor = THEME.colors.primary,
  slideId,
  globalFrame,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const renderColumn = (
    column: ColumnData,
    side: 'left' | 'right',
    bgColor: string,
    textColor: string,
  ) => {
    const baseDelay = side === 'left' ? 5 : 10;
    const colOpacity = interpolate(
      frame,
      [baseDelay, baseDelay + 8],
      [0, 1],
      {extrapolateRight: 'clamp'},
    );
    const colX = interpolate(
      frame,
      [baseDelay, baseDelay + 8],
      [side === 'left' ? -20 : 20, 0],
      {extrapolateRight: 'clamp'},
    );

    return (
      <div
        style={{
          flex: 1,
          opacity: colOpacity,
          transform: `translateX(${colX}px)`,
          backgroundColor: bgColor,
          borderRadius: 16,
          padding: 36,
          border: `1px solid ${THEME.colors.border}`,
        }}
      >
        <div
          style={{
            fontSize: THEME.fontSize.body,
            fontWeight: 700,
            color: textColor,
            fontFamily: THEME.fonts.heading,
            marginBottom: 24,
          }}
        >
          {column.heading}
        </div>
        {column.items.map((item, i) => {
          const itemDelay = baseDelay + 8 + i * 4;
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + 6],
            [0, 1],
            {extrapolateRight: 'clamp'},
          );

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                fontSize: THEME.fontSize.small,
                color: THEME.colors.text,
                fontFamily: THEME.fonts.body,
                lineHeight: 1.6,
                marginBottom: 12,
                paddingLeft: 16,
                borderLeft: `3px solid ${textColor}40`,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <SlideLayout
      globalFrame={globalFrame}
      slideId={slideId}
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

      {/* Columns */}
      <div style={{display: 'flex', gap: 30}}>
        {renderColumn(leftColumn, 'left', `${THEME.colors.error}10`, THEME.colors.error)}
        {renderColumn(rightColumn, 'right', `${THEME.colors.success}10`, THEME.colors.success)}
      </div>
    </SlideLayout>
  );
};
