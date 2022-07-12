import React, { ReactNode } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { configureStore } from '@reduxjs/toolkit';
import EditSort from '../model/sorts/components/EditSort';
import { RootState } from 'store';
import { Provider } from 'react-redux';


const MockedStore = ({ initialState, children } : { initialState: RootState, children: ReactNode }) => 
  <Provider store={configureStore({
    reducer: (state = initialState, action) => state
  })}>
    {children}
  </Provider>;

export default {
  component: EditSort,
  title: 'EditSort',
  decorators: [
    story => <div style={{ width: 300, border: `1px solid`, margin: 5 }}>{story()}</div>
  ]
} as ComponentMeta<typeof EditSort>;

const Template: ComponentStory<typeof EditSort> = (args) => <EditSort {...args} />;


export const Empty = Template.bind({});
Empty.args = {};
Empty.decorators = [
  story => <MockedStore initialState={{
    model: {
      sorts: {
        ids: [], entities: {}
      },
      relations: {
        ids: [], entities: {}
      }
    }
  }}>{story()}</MockedStore>
];

export const Filled = Template.bind({});
Filled.args = {
  sortId: 'X'
};
Filled.decorators = [
  story => <MockedStore initialState={{
    model: {
      relations: {
        ids: [], entities: {}
      },
      sorts: {
        ids: ['X'], entities: { 'X': { id: 'X', size: 8, relations: [] } }
      }
    }
  }}>{story()}</MockedStore>
];