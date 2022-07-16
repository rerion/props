import { ComponentMeta, ComponentStory } from '@storybook/react';
import RelationGrid from 'model/relations/components/RelationGrid';
import { useState } from 'react';


export default {
  component: RelationGrid,
  title: 'RelationGrid',
  decorators: [
    story => <div style={{ margin: 5 }}>{story()}</div>
  ]
} as ComponentMeta<typeof RelationGrid>;

const Template: ComponentStory<typeof RelationGrid> = args => <RelationGrid {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  dimensions: [5, 5],
  checkedMap: {}
};

export const SomeChecked = Template.bind({});
SomeChecked.storyName = 'Some properties checked';
SomeChecked.args = {
  dimensions: [3, 7],
  checkedMap: {
    '2-1': true, '1-1': true, '0-6': true, '2-5': true
  }
};

function WrappedRelGrid() {
  const [map, setMap] = useState<{ [key: string]: boolean | undefined }>({});
  
  const dimensions: [number, number] = [3, 7];
  const onClick = ([x, y]: [number, number]) => {
    const key = `${x}-${y}`;
    setMap({
      ...map,
      [key]: !map[key]
    });
  }

  return <RelationGrid dimensions={dimensions} checkedMap={map} onClick={onClick} />;
}

export const Interactive = (() => <WrappedRelGrid />).bind({});