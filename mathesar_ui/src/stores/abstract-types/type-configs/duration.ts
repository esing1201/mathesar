import type { FormValues } from '@mathesar-component-library/types';
import type { Column } from '@mathesar/stores/table-data/types';
import type { DurationDisplayOptions } from '@mathesar/api/tables/columns';
import type {
  AbstractTypeConfigForm,
  AbstractTypeConfiguration,
} from '../types';

const defaultMax = 'm';
const defaultMin = 's';

const displayForm: AbstractTypeConfigForm = {
  variables: {
    /**
     * For the sake of time, use a custom component
     * for duration config.
     *
     * TODO: Make this serializable instead of the
     * custom component.
     */
    durationConfig: {
      type: 'custom',
      default: {
        max: defaultMax,
        min: defaultMin,
      },
    },
  },
  layout: {
    orientation: 'vertical',
    elements: [
      {
        type: 'static',
        variable: 'durationConfig',
        componentId: 'duration-config-menu',
      },
    ],
  },
};

function determineDisplayOptions(
  dispFormValues: FormValues,
): Column['display_options'] {
  const displayOptions: Column['display_options'] = {
    ...(dispFormValues.durationConfig as Record<string, unknown>),
    show_units: false,
  };
  return displayOptions;
}

function constructDisplayFormValuesFromDisplayOptions(
  columnDisplayOpts: Column['display_options'],
): FormValues {
  const displayOptions = columnDisplayOpts as DurationDisplayOptions | null;
  const dispFormValues: FormValues = {
    durationConfig: {
      max: displayOptions?.max ?? defaultMax,
      min: displayOptions?.min ?? defaultMin,
    },
  };
  return dispFormValues;
}

const durationType: AbstractTypeConfiguration = {
  icon: ':',
  cell: {
    type: 'string',
  },
  getDisplayConfig: () => ({
    form: displayForm,
    determineDisplayOptions,
    constructDisplayFormValuesFromDisplayOptions,
  }),
};

export default durationType;
