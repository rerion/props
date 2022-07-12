import RelationGrid from 'model/relations/components/RelationGrid';
import React from 'react';


export default {
  component: RelationGrid,
  title: 'RelationGrid',
};

const Template: any = (args: any) => <RelationGrid {...args} />;


export const Empty = Template.bind({});
Empty.args = {}

export const Another = Template.bind({});
Another.args = {}