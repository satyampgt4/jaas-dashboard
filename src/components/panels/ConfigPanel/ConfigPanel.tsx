import { ReactElement, useEffect, useState } from "react";
import { getApplicationConfig } from "juju/index";
import { useStore } from "react-redux";
import classnames from "classnames";

import BooleanConfig from "./BooleanConfig";
import TextAreaConfig from "./TextAreaConfig";

import "./_config-panel.scss";

type Props = {
  appName: string;
  title: ReactElement;
  modelUUID: string;
};

type ConfigData = {
  name: string;
  default: any;
  description: string;
  source: "default" | "user";
  type: "string" | "int" | "float" | "boolean";
  value: any;
  newValue: any;
};

type Config = {
  [key: string]: ConfigData;
};

export type ConfigProps = {
  config: ConfigData;
  selectedConfig: ConfigData | undefined;
  setSelectedConfig: Function;
  setNewValue: SetNewValue;
};

type SetNewValue = (name: string, value: any) => void;

export default function ConfigPanel({
  appName,
  title,
  modelUUID,
}: Props): ReactElement {
  const reduxStore = useStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<ConfigData | undefined>(
    undefined
  );
  const [shouldShowDrawer, setShouldShowDrawer] = useState<Boolean>(false);

  useEffect(() => {
    getApplicationConfig(modelUUID, appName, reduxStore.getState()).then(
      (result) => {
        // Add the key to the config object to make for easier use later.
        const config: Config = {};
        Object.keys(result.config).forEach((key) => {
          config[key] = result.config[key];
          config[key].name = key;
        });
        setConfig(config);
      }
    );
  }, [appName, modelUUID, reduxStore]);

  function setNewValue(name: string, value: any) {
    config[name].newValue = value;
    if (config[name].newValue === config[name].value) {
      delete config[name].newValue;
    }
    const fieldChanged = Object.keys(config).some(
      (key) => config[key].newValue
    );
    if (fieldChanged) {
      setShouldShowDrawer(true);
    } else if (!fieldChanged && shouldShowDrawer) {
      setShouldShowDrawer(false);
    }
    setConfig(config);
  }

  return (
    <div className="config-panel">
      <div className="row">
        <div className="config-panel__config-list col-6">
          <div className="config-panel__list-header">{title}</div>
          <div className="config-panel__list">
            {generateConfigElementList(
              config,
              selectedConfig,
              setSelectedConfig,
              setNewValue
            )}
          </div>
          <div
            className={classnames("config-panel__drawer", {
              "config-panel__drawer--hidden": !shouldShowDrawer,
            })}
          >
            <button className="p-button--neutral">Cancel</button>
            <button className="p-button--positive">Save & appply</button>
          </div>
        </div>
        <div className="config-panel__description col-6">
          {selectedConfig ? (
            <>
              <h4>Configuration Description</h4>
              <h5>{selectedConfig.name}</h5>
              <pre>{selectedConfig.description}</pre>
            </>
          ) : (
            <div className="config-panel__no-description u-vertically-center">
              <div>
                Click on a configuration row to view its related description and
                parameters
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateConfigElementList(
  configs: Config,
  selectedConfig: ConfigData | undefined,
  setSelectedConfig: Function,
  setNewValue: SetNewValue
) {
  const elements = Object.keys(configs).map((key) => {
    const config = configs[key];
    if (config.type === "boolean") {
      return (
        <BooleanConfig
          key={config.name}
          config={config}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          setNewValue={setNewValue}
        />
      );
    } else {
      return (
        <TextAreaConfig
          key={config.name}
          config={config}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          setNewValue={setNewValue}
        />
      );
    }
  });

  return elements;
}
