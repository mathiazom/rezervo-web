export type EnterLeaveAnimation = {
  enter: string;
  leave: string;
};

export const OVER_THE_TOP_ANIMATIONS: Array<EnterLeaveAnimation> = [
  { enter: "melt-enter-active", leave: "melt-leave-active" },
  { enter: "circle-enter-active", leave: "circle-leave-active" },
  { enter: "spiral-enter-active", leave: "spiral-leave-active" },
  { enter: "box-wipe-enter-active", leave: "box-wipe-leave-active" },
  { enter: "chevron-enter-active", leave: "chevron-leave-active" },
  { enter: "drops-enter-active", leave: "drops-leave-active" },
];
