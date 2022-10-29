export interface ITranslation {
    readonly locale: string;
    readonly name: string;
    readonly description: string;

    readonly site: ISiteTranslationTabels;
    readonly home: IHomeTranslationLabels;
    readonly expenses: IExpensesTranslationLabels;
    readonly about: IAboutTranslationLabels;
}

export interface ISiteTranslationTabels {
    readonly title: string;
    readonly headerSubtitle: string;
    readonly footerSubtitle: string;

    readonly logExpenseButtonLabel: string;
    readonly logoutButtonLabel: string;

    readonly tabs: {
        readonly home: string;
        readonly expenses: string;
        readonly about: string;
    }
}

export interface IHomeTranslationLabels {
    readonly title: string;
    readonly pageTitle: string;
    readonly description: string;
}

export interface IExpensesTranslationLabels {
    readonly list: {
        readonly title: string;
        readonly pageTitle: string;
        readonly addButtonLabel: string;

        readonly columns: {
            readonly name: string;
            readonly shop: string;
            readonly tags: string;
            readonly price: string;
            readonly quantity: string;
            readonly amount: string;
            readonly date: string;
        };

        readonly totalsRow: {
            readonly total: string;
        };

        readonly empty: string;
    }

    readonly add: {
        readonly title: string;
        readonly pageTitle: string;

        readonly addButtonLabel: string;
        readonly cancelButtonLabel: string;
    };

    readonly edit: {
        title(expenseId: string): string;
        readonly pageTitle: string;
        readonly notFound: {
            readonly title: string;
        };

        readonly updateButtonLabel: string;
        readonly deleteButtonLabel: string;
        readonly cancelButtonLabel: string;

        readonly deleteConfirmation: {
            readonly title: string;
            readonly description: string;
            readonly confirmationMessage: string;
            readonly confirmButtonLabel: string;
            readonly cancelButtonLabel: string;
        }
    };

    readonly form: {
        readonly name: {
            readonly label: string;
            readonly error: {
                readonly required: string;
            };
        };
        readonly shop: {
            readonly label: string;
            readonly error: {
                readonly required: string;
            };
        };
        readonly tags: {
            readonly label: string;
            readonly error: {
                readonly required: string;
            };

            readonly addMoreButtonLabel: string;
        };
        readonly currency: {
            readonly error: {
                readonly required: string;
            };
        };
        readonly price: {
            readonly label: string;
            readonly error: {
                readonly required: string;
            };
        };
        readonly quantity: {
            readonly label: string;
            readonly error: {
                readonly required: string;
            };
        };
        readonly date: {
            readonly label: string;
            readonly error: {
                readonly required: string;
            };
        };

        readonly error: {
            readonly unknown: string;
            readonly invalidEtag: string;
            readonly notFound: IFormErrorCallback<(expenseMonth: string) => readonly string[]>;
        }
    }
}

export interface IAboutTranslationLabels {
    readonly title: string;
    readonly skit: string;
    readonly description: string;
    readonly externalResources: {
        readonly title: string;
        readonly websites: readonly {
            readonly description: string;
            readonly resources: readonly string[];
        }[];
    };
}

export type IFormError = string | { readonly message: string; readonly actions: readonly string[]; };

export type IFormErrorCallback<TCallback extends (...args: readonly any[]) => readonly string[]> = (...args: Parameters<TCallback>) => IFormError;