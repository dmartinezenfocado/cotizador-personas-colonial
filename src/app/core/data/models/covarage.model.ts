import CovarageInclude from "./covarage.include.model";

export default interface Covarage  {
    coverageCode: number;
    name: string,
    riskValue: number;
    description: string;
    coverageIncludes: CovarageInclude[]
  }