import { Composition } from 'remotion';
import { PrepFilm, PREP_FILM_DURATION, FPS } from './PrepFilm';

export const Root: React.FC = () => (
  <Composition
    id="PrepFilm"
    component={PrepFilm}
    durationInFrames={PREP_FILM_DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
