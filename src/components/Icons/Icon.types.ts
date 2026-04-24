export type TIconName = "arrow-up-right" | "github" | "github-alt" | "linkedin" | "maple-leaf" | "resume" | "x-logo";

export interface IIconProps {
  size?: number;
  fill?: string;
}

export interface IIconComponentProps extends IIconProps {
  name: TIconName;
}

export type TIconComponent = (_props: IIconProps) => unknown;