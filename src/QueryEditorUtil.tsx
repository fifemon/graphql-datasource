import {Icon, LegacyForms} from "@grafana/ui";
import React, {ChangeEvent} from "react";


export function createDataPathForm(dataPath: string, onDataPathTextChange: (event: ChangeEvent<HTMLInputElement>) => void) {
  return <>
    <div className="gf-form">
      <LegacyForms.FormField
        labelWidth={8}
        inputWidth={24}
        value={dataPath}
        onChange={onDataPathTextChange}
        label="Data path"
        tooltip="dot-delimited path to data in response. Separate with commas to use multiple data paths"
      />
    </div>
  </>
}

export function createTimeFormatForm(timeFormat: string, onTimeFormatTextChange: (event: ChangeEvent<HTMLInputElement>) => void) {
  return <>
    <div className={'gf-form'}>
      <LegacyForms.FormField
        labelWidth={8}
        inputWidth={24}
        value={timeFormat || ''}
        onChange={onTimeFormatTextChange}
        label="Time format"
        tooltip={
          <a href="https://momentjs.com/docs/#/parsing/string-format/" title="Formatting help">
            Optional time format in moment.js format.&nbsp;
            <Icon name="external-link-alt" />
          </a>
        }
      />
    </div>
  </>
}
