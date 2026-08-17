import ChartCard from './ChartCard';
import { FaChartBar, FaDownload } from 'react-icons/fa';

export default {
  title: 'Common/ChartCard',
  component: ChartCard,
  tags: ['autodocs'],
};

const Template = (args) => <ChartCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Asistencia semanal',
  children: (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#968b76' }}>
      [Chart placeholder]
    </div>
  ),
};

export const WithIconAndAction = Template.bind({});
WithIconAndAction.args = {
  title: 'Nuevos miembros',
  icon: <FaChartBar />,
  action: <button className="btn btn--icon"><FaDownload /></button>,
  children: (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#968b76' }}>
      [Chart placeholder]
    </div>
  ),
};
