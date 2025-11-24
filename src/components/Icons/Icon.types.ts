export type TIconName = "maple-leaf";

export interface IIconProps {
  size?: number;
  fill?: string;
}

export interface IIconComponentProps extends IIconProps {
  name: TIconName;
}

export type TIconComponent = (_props: IIconProps) => unknown;