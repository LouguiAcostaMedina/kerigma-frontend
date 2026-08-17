import { useState } from 'react';
import Modal from './Modal';

export default {
  title: 'Common/Modal',
  component: Modal,
  tags: ['autodocs'],
};

const Template = (args) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button className="btn btn--primary" onClick={() => setOpen(true)}>
        Abrir modal
      </button>
      <Modal {...args} open={open} onClose={() => setOpen(false)}>
        <div style={{ padding: 24 }}>
          <h2>Contenido del modal</h2>
          <p>Este es un ejemplo del componente Modal con size aliases.</p>
        </div>
      </Modal>
    </>
  );
};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
  title: 'Modal pequeño',
};

export const Medium = Template.bind({});
Medium.args = {
  size: 'md',
  title: 'Modal mediano',
};

export const Large = Template.bind({});
Large.args = {
  size: 'lg',
  title: 'Modal grande',
};

export const ExtraLarge = Template.bind({});
ExtraLarge.args = {
  size: 'xl',
  title: 'Modal extra grande',
};

export const FullScreen = Template.bind({});
FullScreen.args = {
  size: 'fullscreen',
  title: 'Modal pantalla completa',
};
