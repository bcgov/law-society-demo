import { Configuration } from "./appConfig";

export enum StateType {
  NONE,
  INITIALIZED,
  UPDATED,
  ERROR
}

export interface RootState {
  version: string;
}

export interface ConfigurationState {
  configuration: Configuration;
  statusMessage: string;
  error: any; //eslint-disable-line
  stateType: StateType;
}
