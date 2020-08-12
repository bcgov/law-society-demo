import { AppConfig, Configuration } from "@/models/appConfig";
import { ConfigurationState, RootState } from "@/models/storeState";
import * as ConfigService from "@/services/config";
import { ActionContext, ActionTree } from "vuex";

export const actions: ActionTree<ConfigurationState, RootState> = {
  async getConfiguration(
    context: ActionContext<ConfigurationState, RootState>
  ): Promise<Configuration> {
    return new Promise<Configuration>((resolve, reject) => {
      const config = context.rootGetters[
        "configuration/getConfiguration"
      ] as Configuration;
      if (config && config.app) {
        return resolve(config);
      } else {
        Promise.all([ConfigService.getAppConfig()])
          .then(values => {
            const config = values[0] as AppConfig;
            context.commit("setAppConfig", config);
            return resolve(context.getters("getConfiguration"));
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }
};
