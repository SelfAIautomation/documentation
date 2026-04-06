import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {THEME} from '../data/theme';
import {SlideLayout} from './SlideLayout';

interface TableSlideProps {
  title: string;
  headers: string[];
  rows: string[][];
  accentColor?: string;
  slideId?: string;
  globalFrame: number;
  slideNumber: number;
  totalSlides: number;
}

export const TableSlide: React.FC<TableSlideProps> = ({
  title,
  headers,
  rows,
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
  const tableOpacity = interpolate(frame, [6, 16], [0, 1], {
    extrapolateRight: 'clamp',
  });

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

      {/* Table */}
      <div
        style={{
          opacity: tableOpacity,
          backgroundColor: THEME.colors.surface,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${THEME.colors.border}`,
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            backgroundColor: `${accentColor}20`,
            borderBottom: `2px solid ${accentColor}40`,
          }}
        >
          {headers.map((header, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '16px 24px',
                fontSize: THEME.fontSize.small,
                fontWeight: 700,
                color: accentColor,
                fontFamily: THEME.fonts.heading,
              }}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, rowIndex) => {
          const rowDelay = 8 + rowIndex * 5;
          const rowOpacity = interpolate(
            frame,
            [rowDelay, rowDelay + 7],
            [0, 1],
            {extrapolateRight: 'clamp'},
          );
          const rowX = interpolate(
            frame,
            [rowDelay, rowDelay + 7],
            [15, 0],
            {extrapolateRight: 'clamp'},
          );

          return (
            <div
              key={rowIndex}
              style={{
                display: 'flex',
                opacity: rowOpacity,
                transform: `translateX(${rowX}px)`,
                borderBottom:
                  rowIndex < rows.length - 1
                    ? `1px solid ${THEME.colors.border}`
                    : 'none',
              }}
            >
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    fontSize: THEME.fontSize.small,
                    color: THEME.colors.text,
                    fontFamily: THEME.fonts.body,
                    lineHeight: 1.4,
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </SlideLayout>
  );
};
