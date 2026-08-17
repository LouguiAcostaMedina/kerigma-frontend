import FormFooter from './FormFooter';

export default {
  title: 'Common/FormFooter',
  component: FormFooter,
  tags: ['autodocs'],
};

const Template = (args) => <FormFooter {...args} />;

export const Default = Template.bind({});
Default.args = {
  onCancel: () => console.log('cancel'),
};

export const Saving = Template.bind({});
Saving.args = {
  onCancel: () => console.log('cancel'),
  saving: true,
};

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  onCancel: () => console.log('cancel'),
  labels: { cancel: 'Volver', submit: 'Crear grupo' },
};
