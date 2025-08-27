import { Gantt } from "../src";
import { FlexibleHeight } from "./FlexibleHeight";
import { Meta, StoryObj } from "@storybook/react";

// eslint-disable-next-line
const Template = (props: any) => {
  return <FlexibleHeight {...props} />;
};

const meta: Meta<typeof Gantt> = {
  title: "FlexibleHeight",
  component: Gantt,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type GanttStory = StoryObj<typeof Gantt>;

export const FlexibleHeightDemo: GanttStory = {
  render: Template.bind({}),
  name: "Flexible Height Demo",
};
