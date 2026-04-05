import React from 'react';
import {Composition} from 'remotion';
import {MainVideo} from './Video';
import {TOTAL_FRAMES} from './data/scenes';
import {THEME} from './data/theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={THEME.video.fps}
        width={THEME.video.width}
        height={THEME.video.height}
      />
    </>
  );
};
