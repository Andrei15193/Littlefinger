import type { ITranslation } from "../Translation";
import { siteTranslationLabels } from "./site";
import { homeTranslationLabels } from "./home";
import { expensesTranslationLabels } from "./expenses";
import { aboutTranslationLabels } from "./about";

export const enGB: ITranslation = {
    locale: "en-GB",
    name: "British English",
    description: "This website is displayed in British English.",

    site: siteTranslationLabels,
    home: homeTranslationLabels,
    expenses: expensesTranslationLabels,
    about: aboutTranslationLabels
}