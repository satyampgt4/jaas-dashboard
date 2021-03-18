import { useEffect, useRef, useState, ReactNode } from "react";
import classnames from "classnames";

import type {
  ActionOptions,
  SetSelectedAction,
} from "panels/ActionsPanel/ActionsPanel";

import "./_radio-input-box.scss";

type Props = {
  name: string;
  description: string;
  options: ActionOptions;
  selectedAction: string | undefined;
  onSelect: SetSelectedAction;
};

export default function RadioInputBox({
  name,
  description,
  options,
  selectedAction,
  onSelect,
}: Props): JSX.Element {
  const [opened, setOpened] = useState<boolean>(false);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 40 is a magic number that aligns nicely with the height of 2.5rem;
  const renderedHeight = 40;

  useEffect(() => {
    setOpened(selectedAction === name);
  }, [selectedAction, name]);

  useEffect(() => {
    const wrapper = inputBoxRef.current;
    const container = containerRef.current;

    if (wrapper === null || container === null) return;

    let startHeight = 0;
    let endHeight = 0;
    let duration = 0;
    if (opened) {
      startHeight = wrapper.offsetHeight;
      // To be used when we're closing so we know what the original value was.
      endHeight = container.offsetHeight + 20; // 20 is magic
      duration = endHeight;
      // Set the height of the wrapper element to the end height to
      // override the height set in css for the collapsed size.
      wrapper.style.height = endHeight + "px";
      // If the element hasn't been opened then we do not want to animate
      // it closed again. This is to prevent the animation happening on the
      // panel opening and the elements being initially rendered to the page.
    } else if (wrapper.offsetHeight > 40) {
      endHeight = renderedHeight;
      startHeight = container.offsetHeight + 20; // 20 is magic
      duration = startHeight;
    }
    const animation = wrapper.animate(
      {
        height: [startHeight + "px", endHeight + "px"],
      },
      {
        // Set the duration to be the number of pixels that it has to animate
        // so that it's a consistent animation regardless of the height.
        duration,
        easing: "ease-out",
      }
    );

    animation.onfinish = () => {
      if (opened === false) {
        wrapper.style.height = renderedHeight + "px";
      }
    };
  }, [opened, renderedHeight]);

  const handleSelect = () => {
    onSelect(name);
  };

  const labelId = `actionRadio-${name}`;

  const generateDescription = (description: string): ReactNode => {
    // 30 is a magic number, the width of the available text area of the field
    // If the width of the actions area increases then this number will need
    // to be adjusted accordingly.
    if (description.length > 30) {
      return (
        <details className="radio-input-box__details">
          <summary className="radio-input-box__summary">
            <span className="radio-input-box__summary-description">
              {description}
            </span>
            &nbsp;
          </summary>
          <span className="radio-input-box__details-description">
            {description}
          </span>
        </details>
      );
    }
    return description;
  };

  const generateOptions = (options: ActionOptions): JSX.Element => {
    return (
      <form>
        {options.map((option) => {
          const inputKey = `${option.name}Input`;
          return (
            <div
              className="radio-input-box__input-group"
              key={`${option.name}InputGroup`}
            >
              <label
                className={classnames("radio-input-box__label", {
                  "radio-input-box__label--required": option.required,
                })}
                htmlFor={inputKey}
              >
                {option.name}
              </label>
              <input
                className="radio-input-box__input"
                type="text"
                id={inputKey}
                name={inputKey}
              ></input>
              {generateDescription(option.description)}
            </div>
          );
        })}
      </form>
    );
  };

  return (
    <div className="radio-input-box" aria-expanded={opened} ref={inputBoxRef}>
      <div className="radio-input-box__container" ref={containerRef}>
        <label className="p-radio radio-input-box__label">
          <input
            type="radio"
            className="p-radio__input"
            name="actionRadioSelector"
            aria-labelledby={labelId}
            onClick={handleSelect}
            onChange={handleSelect}
          />
          <span className="p-radio__label" id={labelId}>
            {name}
          </span>
        </label>
        <div className="radio-input-box__content">
          <div className="radio-input-box__description">{description}</div>
          <div className="radio-input-box__options">
            {generateOptions(options)}
          </div>
        </div>
      </div>
    </div>
  );
}
