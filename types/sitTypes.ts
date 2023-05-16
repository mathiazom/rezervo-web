export type SitSchedule = {
  days: SitScheduleDay[];
};

export type SitScheduleDay = {
  date: string;
  dayName: string;
  classes: SitClass[];
};

export type SitClass = {
  id: number;
  activityId: string;
  available: number;
  capacity: number;
  studio: SitStudio;
  from: string;
  to: string;
  name: string;
  description: string;
  category: SitCategory;
  image: string;
  color: string;
  instructors: SitInstructor[];
  weekday?: number;
};

export type SitStudio = {
  id: number;
  name: string;
};

export type SitInstructor = {
  id: number;
  name: string;
};

export type SitCategory = {
  id: string;
  name: string;
  excelineId: number;
};
