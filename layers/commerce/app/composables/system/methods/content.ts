import type { Simplify } from '../defs/typeHelpers';

export type ContentEntity = Record<string, any>;

export interface GetBrandBarExtendedArgs {}
export interface GetBrandBarCustomArgs {}

export type GetBrandBarArgs = {
  //$extended?: GetBrandBarExtendedArgs;
  //$custom?: GetBrandBarCustomArgs;
};

export type GetBrandBar = (args?: Simplify<GetBrandBarArgs>) => Promise<ContentEntity>;

export interface GetContentPageExtendedArgs {}
export interface GetContentPageCustomArgs {}

export type GetContentPageArgs = {
  slug?: string;
  id?: string;
  //$extended?: GetContentPageExtendedArgs;
  //$custom?: GetContentPageCustomArgs;
};

export type GetContentPage = (args?: Simplify<GetContentPageArgs>) => Promise<ContentEntity | null>;

export type DotdigitalChatConfig = {
  provider: 'dotdigital';
  enabled: boolean;
  websiteId: string | number | null;
  chatId: string | number | null;
  scriptUrl: string | null;
  launcherUrl?: string | null;
  environment: string | null;
  raw: ContentEntity;
};

export interface GetDotdigitalChatConfigExtendedArgs {}
export interface GetDotdigitalChatConfigCustomArgs {}

export type GetDotdigitalChatConfigArgs = {
  //$extended?: GetDotdigitalChatConfigExtendedArgs;
  //$custom?: GetDotdigitalChatConfigCustomArgs;
};

export type GetDotdigitalChatConfig = (
  args?: Simplify<GetDotdigitalChatConfigArgs>
) => Promise<DotdigitalChatConfig | null>;

export type ProductRssFeed = {
  title: string;
  link: string;
  type: string;
  identity?: string;
  collection?: string;
};

export interface GetProductRssFeedsExtendedArgs {}
export interface GetProductRssFeedsCustomArgs {}

export type GetProductRssFeedsArgs = {
  product: ContentEntity;
  identity?: string;
  collection?: string;
  feedPath?: string;
  siteUrl?: string;
  //$extended?: GetProductRssFeedsExtendedArgs;
  //$custom?: GetProductRssFeedsCustomArgs;
};

export type GetProductRssFeeds = (
  args: Simplify<GetProductRssFeedsArgs>
) => Promise<ProductRssFeed[]>;

export type GetProductRssLink = (
  args: Simplify<GetProductRssFeedsArgs>
) => Promise<{ link: string | null }>;