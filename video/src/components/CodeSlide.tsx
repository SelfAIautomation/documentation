import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Highlight, themes} from 'prism-react-renderer';
import {THEME} from '../data/theme';
import {SlideLayout} from './SlideLayout';

interface CodeSlideProps {
  title: string;
  code: string;
  language: string;
  accentColor?: string;
  slideId?: string;
  globalFrame: number;
  slideNumber: number;
  totalSlides: number;
}

export const CodeSlide: React.FC<CodeSlideProps> = ({
  title,
  code,
  language,
  accentColor = THEME.colors.primary,
  slideId,
  globalFrame,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const codeOpacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const codeY = interpolate(frame, [6, 18], [15, 0], {
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

      {/* Code block */}
      <div
        style={{
          opacity: codeOpacity,
          transform: `translateY(${codeY}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: THEME.colors.codeBg,
            borderRadius: 16,
            padding: 40,
            border: `1px solid ${THEME.colors.border}`,
            overflow: 'hidden',
          }}
        >
          {/* Language label */}
          <div
            style={{
              fontSize: THEME.fontSize.label,
              color: THEME.colors.textMuted,
              fontFamily: THEME.fonts.code,
              marginBottom: 20,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            {language}
          </div>
          <Highlight theme={themes.nightOwl} code={code} language={language}>
            {({tokens, getLineProps, getTokenProps}) => (
              <pre
                style={{
                  margin: 0,
                  fontFamily: THEME.fonts.code,
                  fontSize: THEME.fontSize.code,
                  lineHeight: 1.7,
                }}
              >
                {tokens.map((line, i) => {
                  const lineDelay = 8 + i * 2;
                  const lineOpacity = interpolate(
                    frame,
                    [lineDelay, lineDelay + 6],
                    [0, 1],
                    {extrapolateRight: 'clamp'},
                  );
                  return (
                    <div
                      key={i}
                      {...getLineProps({line})}
                      style={{opacity: lineOpacity}}
                    >
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({token})} />
                      ))}
                    </div>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </div>
      </div>
    </SlideLayout>
  );
};
