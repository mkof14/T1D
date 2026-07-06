import React from 'react';
import { PageHeroBanner, type PageHeroBannerProps } from './PageHeroBanner';

/** Full-bleed member hero — same treatment as public page banners. */
export const MemberPageHero: React.FC<PageHeroBannerProps> = (props) => (
  <PageHeroBanner {...props} bleed priority compact={false} />
);
