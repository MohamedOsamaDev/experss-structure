import { landingPageModel } from "../../database/models/pages/landing.model.js";
import {
  landingCreateVal,
  landingUpdateVal,

} from "./page.validation.js";

export const allPagesConfig = {
  landing: {
    validation: {
      create: landingCreateVal,
      update: landingUpdateVal,
    },
    Model: landingPageModel,
  },
};
