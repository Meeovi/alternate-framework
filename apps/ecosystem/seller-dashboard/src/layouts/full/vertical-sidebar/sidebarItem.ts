import {
  CircleIcon,
  WindmillIcon,
  TypographyIcon,
  ShadowIcon,
  PaletteIcon,
  KeyIcon,
  BugIcon,
  DashboardIcon,
  BrandChromeIcon,
  HelpIcon
} from 'vue-tabler-icons';

export interface menu {
  header ? : string;
  title ? : string;
  icon ? : object;
  to ? : string;
  divider ? : boolean;
  chip ? : string;
  chipColor ? : string;
  chipVariant ? : string;
  chipIcon ? : string;
  children ? : menu[];
  disabled ? : boolean;
  type ? : string;
  subCaption ? : string;
}

const sidebarItem: menu[] = [{
      header: 'Dashboard'
    },
    {
      title: 'Home',
      icon: DashboardIcon,
      to: '/dashboard/default'
    },
    {
      divider: true
    },
    {
      header: 'Manage your Shop'
    },
    {
      title: 'Sales',
      icon: KeyIcon,
      to: '/auth',
      children: [{
          title: 'Orders',
          icon: CircleIcon,
          to: '/auth/login'
        },
        {
          title: 'Incentives',
          icon: CircleIcon,
          to: '/auth/register'
        },
        {
          title: 'Transactions',
          icon: CircleIcon,
          to: '/auth/register'
        },
        {
          title: 'Point of Sale',
          icon: CircleIcon,
          to: '/auth/register'
        }
      ]
    },
    {
      title: 'Catalog',
      icon: KeyIcon,
      to: '/auth',
      children: [{
          title: 'Categories',
          icon: CircleIcon,
          to: '/auth/login'
        },
        {
          title: 'Products',
          icon: CircleIcon,
          to: '/auth/register'
        }
      ]
    },
    {
      title: 'Customers',
      icon: KeyIcon,
      to: '/auth',
      children: [{
          title: 'Emails',
          icon: CircleIcon,
          to: '/auth/login'
        },
        {
          title: 'Frequent Customers',
          icon: CircleIcon,
          to: '/auth/register'
        },
        {
          title: 'Online Customers',
          icon: CircleIcon,
          to: '/auth/register'
        }
      ]
    },
    {
      title: 'Marketing',
      icon: BugIcon,
      to: '/pages/error'
    },
    {
      title: 'Reports',
      icon: BugIcon,
      to: '/pages/error'
    },
        {
      title: 'Shop Details',
      icon: BugIcon,
      to: '/pages/error'
    },
    {
      divider: true
    },
    {
      header: 'Social'
    },
    {
      title: 'Activity Feed',
      icon: TypographyIcon,
      to: '/utils/typography'
    },
    {
      title: 'Spaces',
      icon: ShadowIcon,
      to: '/utils/shadows'
    },
    {
      title: 'Lists',
      icon: PaletteIcon,
      to: '/utils/colors'
    },
    {
      divider: true
    },
    {
      title: 'Integrations',
      icon: BrandChromeIcon,
      to: '/starter'
    },  {
    title: 'Settings',
    icon: HelpIcon,
    to: 'https://codedthemes.gitbook.io/berry-vuetify/',
    type: 'external'
  }
];

export default sidebarItem;
