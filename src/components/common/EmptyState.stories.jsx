import EmptyState from './EmptyState';

export default {
  title: 'Common/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

const Template = (args) => <EmptyState {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithTitle = Template.bind({});
WithTitle.args = {
  title: 'Sin resultados',
  description: 'No se encontraron miembros con los filtros aplicados.',
};

export const WithAction = Template.bind({});
WithAction.args = {
  title: 'Sin iglesias registradas',
  description: 'Comienza agregando tu primera iglesia.',
  action: {
    label: 'Agregar iglesia',
    onClick: () => console.log('clicked'),
  },
};
