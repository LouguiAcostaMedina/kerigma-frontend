import '../src/index.css';
import '../src/assets/styles/globals.css';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#14110b' },
        { name: 'light', value: '#faf6ef' },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Tema SGM',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Oscuro', icon: 'circle' },
          { value: 'light', title: 'Claro', icon: 'circlehollow' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      return <Story />;
    },
  ],
};

export default preview;