import type { ITranslation } from "./Translation";
import { enGB } from "./en-GB";

export class TranslationResolver {
    private static readonly _translations: readonly ITranslation[] = [
        enGB
    ];

    public static getLocales(): readonly string[] {
        return this._translations.reduce<string[]>(
            (result, translation) => {
                const language = translation.locale.split('-')[0]!;
                if (result.indexOf(language) === -1)
                    result.push(language);
                result.push(translation.locale);

                return result;
            },
            []
        );
    }

    public static resolve(locale: string | null): ITranslation {
        if (locale === undefined || locale === null)
            return this._translations[0]!;

        if (locale.length === 2)
            return this._translations.filter(translation => translation.locale.substring(0, 2).localeCompare(locale, "en-GB", { sensitivity: "base" }) === 0)[0] || this._translations[0]!;

        const translation = this._translations.filter(translation => translation.locale.localeCompare(locale, "en-GB", { sensitivity: "base" }) === 0)[0];
        if (translation !== undefined && translation !== null)
            return translation;

        const language = locale.substring(0, 2);
        return this._translations.filter(translation => translation.locale.substring(0, 2).localeCompare(language, "en-GB", { sensitivity: "base" }) === 0)[0]
            || this._translations[0]!;
    }
}