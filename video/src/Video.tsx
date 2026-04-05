import React from 'react';
import {Audio, Series, staticFile} from 'remotion';
import {SLIDES} from './data/scenes';
import {AVAILABLE_AUDIO} from './data/audio-manifest';
import {TitleSlide} from './components/TitleSlide';
import {SectionHeader} from './components/SectionHeader';
import {BulletSlide} from './components/BulletSlide';
import {CodeSlide} from './components/CodeSlide';
import {TableSlide} from './components/TableSlide';
import {TwoColumnSlide} from './components/TwoColumnSlide';

const audioSet = new Set(AVAILABLE_AUDIO);

// Calculate the accent color for a section based on its slides
const getSectionColor = (section: number): string => {
  const sectionSlide = SLIDES.find(
    (s) => s.section === section && s.type === 'sectionHeader',
  );
  return sectionSlide?.style?.accentColor ?? '#3b82f6';
};

// Play audio for a slide if the audio file exists
const SlideAudio: React.FC<{slideId: string}> = ({slideId}) => {
  if (!audioSet.has(slideId)) return null;
  const src = staticFile(`audio/${slideId}.wav`);
  return <Audio src={src} volume={1} />;
};

export const MainVideo: React.FC = () => {
  // Pre-compute global frame offsets for each slide
  const globalFrameOffsets: number[] = [];
  let cumulative = 0;
  for (const slide of SLIDES) {
    globalFrameOffsets.push(cumulative);
    cumulative += slide.durationInFrames;
  }

  const totalSlides = SLIDES.length;

  return (
    <Series>
      {SLIDES.map((slide, index) => {
        const globalFrame = globalFrameOffsets[index];
        const accentColor =
          slide.style?.accentColor ?? getSectionColor(slide.section);

        return (
          <Series.Sequence
            key={slide.id}
            durationInFrames={slide.durationInFrames}
          >
            {slide.content.narration && <SlideAudio slideId={slide.id} />}
            {slide.type === 'title' && (
              <TitleSlide
                title={slide.content.title!}
                subtitle={slide.content.subtitle}
                globalFrame={globalFrame}
              />
            )}
            {slide.type === 'sectionHeader' && (
              <SectionHeader
                title={slide.content.title!}
                subtitle={slide.content.subtitle}
                sectionNumber={slide.section}
                accentColor={accentColor}
                globalFrame={globalFrame}
              />
            )}
            {slide.type === 'bullets' && (
              <BulletSlide
                title={slide.content.title!}
                bullets={slide.content.bullets!}
                accentColor={accentColor}
                globalFrame={globalFrame}
                slideNumber={index + 1}
                totalSlides={totalSlides}
              />
            )}
            {slide.type === 'codeBlock' && (
              <CodeSlide
                title={slide.content.title!}
                code={slide.content.code!.source}
                language={slide.content.code!.language}
                accentColor={accentColor}
                globalFrame={globalFrame}
                slideNumber={index + 1}
                totalSlides={totalSlides}
              />
            )}
            {slide.type === 'table' && (
              <TableSlide
                title={slide.content.title!}
                headers={slide.content.table!.headers}
                rows={slide.content.table!.rows}
                accentColor={accentColor}
                globalFrame={globalFrame}
                slideNumber={index + 1}
                totalSlides={totalSlides}
              />
            )}
            {slide.type === 'twoColumn' && (
              <TwoColumnSlide
                title={slide.content.title!}
                leftColumn={slide.content.leftColumn!}
                rightColumn={slide.content.rightColumn!}
                accentColor={accentColor}
                globalFrame={globalFrame}
                slideNumber={index + 1}
                totalSlides={totalSlides}
              />
            )}
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
