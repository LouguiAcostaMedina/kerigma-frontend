import ExportMenu from './ExportMenu';

export default {
  title: 'Common/ExportMenu',
  component: ExportMenu,
  tags: ['autodocs'],
};

const Template = (args) => <ExportMenu {...args} />;

export const Default = Template.bind({});
Default.args = {
  formats: ['csv', 'xlsx', 'pdf', 'json'],
  onExport: (fmt) => console.log('Export:', fmt),
};

export const OnlyPDF = Template.bind({});
OnlyPDF.args = {
  formats: ['pdf'],
  onExport: (fmt) => console.log('Export:', fmt),
};

export const Small = Template.bind({});
Small.args = {
  formats: ['csv', 'json'],
  onExport: (fmt) => console.log('Export:', fmt),
  size: 'small',
};
