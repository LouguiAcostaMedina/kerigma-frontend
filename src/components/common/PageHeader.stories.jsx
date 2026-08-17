import PageHeader from './PageHeader';
import { FaChurch, FaUsers } from 'react-icons/fa';

export default {
  title: 'Common/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
};

const Template = (args) => <PageHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Iglesias',
  subtitle: 'Gestiona las iglesias del sistema',
  icon: <FaChurch />,
};

export const WithAction = Template.bind({});
WithAction.args = {
  title: 'Usuarios',
  subtitle: 'Administración de usuarios',
  icon: <FaUsers />,
  actionButton: {
    label: 'Nuevo usuario',
    onClick: () => console.log('clicked'),
  },
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  title: 'Reportes',
  icon: <FaChurch />,
  children: <span style={{ color: '#e2a63f' }}>Filtros activos</span>,
};
