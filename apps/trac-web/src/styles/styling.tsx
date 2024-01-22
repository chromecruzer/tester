import * as BandLTheme from './BandLTheme';

/* eslint-disable-next-line */
export interface StylingProps {
  children: any[]
}

export const theme = {
  typography: {
    fontFamily: BandLTheme.fontFamily.body.join(',')
  },
  palette: {
    common: BandLTheme.common,
    primary: BandLTheme.primary,
    secondary: BandLTheme.secondary,
    ecp: BandLTheme.ecp,
    tertiary_orange: BandLTheme.tertiary_orange,
  },
}
