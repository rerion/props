import { forwardRef } from 'react';
import { createTheme, ThemeProvider, LinkProps } from '@mui/material';
import { BrowserRouter, Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

import AppRoutes from './AppRoutes';


const Link = forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] }>
  ((props, ref) => {
    const { href, ...rest } = props;
    return <RouterLink ref={ref} to={href} {...rest} />;
})

const theme = createTheme({
  components: {
    MuiLink: {
      defaultProps: {
        component: Link
      } as LinkProps
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: Link,
      },
    },
  }
});

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  );
}
