import RoleSelect from './RoleSelect';

export default {
  title: 'Common/RoleSelect',
  component: RoleSelect,
  tags: ['autodocs'],
};

const Template = (args) => <RoleSelect {...args} />;

export const Default = Template.bind({});
Default.args = {
  value: '',
  onChange: (e) => console.log('selected:', e.target.value),
};

export const WithValue = Template.bind({});
WithValue.args = {
  value: 'pastor',
  onChange: (e) => console.log('selected:', e.target.value),
};

export const ExcludeAdmin = Template.bind({});
ExcludeAdmin.args = {
  value: '',
  onChange: (e) => console.log('selected:', e.target.value),
  exclude: ['admin'],
};
