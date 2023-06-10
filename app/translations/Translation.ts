export interface ITranslation {
    readonly locale: string;
    readonly name: string;
    readonly description: string;

    readonly site: ISiteTranslationTabels;
    readonly home: IHomeTranslationLabels;
    readonly expenses: IExpensesTranslationLabels;
    readonly expenseTemplates: IExpenseTemplatesTranslationLabels;
    readonly expenseShops: IExpenseShopsTranslationLabels;
    readonly expenseTags: IExpenseTagsTranslationLabels;
    readonly about: IAboutTranslationLabels;
}

export interface ISiteTranslationTabels {
    readonly title: string;
    readonly headerSubtitle: string;
    readonly footerSubtitle: string;

    readonly logExpenseButtonLabel: string;
    readonly loginButtonLabel: string;
    readonly registerButtonLabel: string;
    readonly logoutButtonLabel: string;

    readonly environments: {
        readonly development: IEnvironmentTranslationLabels;
        readonly test: IEnvironmentTranslationLabels;
    }

    readonly userFlowTitles: {
        readonly signIn: string;
        readonly signUp: string;
        readonly passwordReset: string;
    }

    readonly tabs: {
        readonly home: string;
        readonly expenses: string;
        readonly about: string;
    }
}

export interface IEnvironmentTranslationLabels {
    readonly name: string;
    readonly description: string | null;
}

export interface IHomeTranslationLabels {
    readonly title: string;
    readonly pageTitle: string;
    readonly description: string;
}

export interface IExpensesTranslationLabels {
    readonly states: {
        readonly changingMonth: string;
    }
    readonly warnings: {
        monthChange(expenseDate: string): string;
    }

    readonly list: {
        readonly title: string;
        readonly pageTitle: string;
        readonly addButtonLabel: string;
        readonly currentMonthLabel: string;
        readonly untagged: string;

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
            readonly message: string;
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
            readonly notEditable: string;
            readonly unknown: string;
            readonly invalidEtag: string;
            readonly notFound: IFormErrorCallback<(expenseMonth: string) => readonly string[]>;
        }
    }
}

export interface IExpenseTemplatesTranslationLabels {
    readonly list: {
        readonly title: string;
        readonly pageTitle: string;
        readonly addButtonLabel: string;

        readonly columns: {
            readonly name: string;
            readonly actions: string;
        };

        readonly empty: string;
    }

    readonly add: {
        readonly title: string;
        readonly pageTitle: string;

        readonly addButtonLabel: string;
        readonly cancelButtonLabel: string;
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
        readonly dayOfMonth: {
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

export interface IExpenseShopsTranslationLabels {
    readonly states: {
        readonly renaming: string;
    }
    readonly warnings: {
        rename(newName: string): string;
        renameTarget(initialName: string): string;
    }

    readonly list: {
        readonly title: string;
        readonly pageTitle: string;

        readonly columns: {
            readonly name: string;
            readonly actions: string;
        }

        readonly actions: {
            readonly rename: string;
            readonly delete: string;
        }

        readonly empty: string;
    }

    readonly rename: {
        readonly modal: {
            title(expenseShopName: string): string;

            readonly name: {
                readonly label: string;
                readonly error: {
                    readonly required: string;
                }
            };

            readonly message: string;
            readonly confirmButtonLabel: string;
            readonly cancelButtonLabel: string;
        }

        readonly errors: {
            readonly notEditable: string;
            readonly notFound: string;
            readonly invalidEtag: string;
            readonly targetNotReady: string;
        }
    }

    readonly delete: {
        readonly modal: {
            title(expenseShopName: string): string;

            readonly message: string;
            readonly confirmButtonLabel: string;
            readonly cancelButtonLabel: string;
        }

        readonly errors: {
            readonly notEditable: string;
            readonly notFound: string;
            readonly invalidEtag: string;
        }
    }
}

export interface IExpenseTagsTranslationLabels {
    readonly states: {
        readonly renaming: string;
        readonly removing: string;
    }
    readonly warnings: {
        readonly remove: string;

        rename(newName: string): string;
        renameTarget(initialName: string): string;
    }

    readonly list: {
        readonly title: string;
        readonly pageTitle: string;

        readonly columns: {
            readonly name: string;
            readonly actions: string;
        }

        readonly actions: {
            readonly edit: string;
            readonly remove: string;
        }

        readonly empty: string;
    }

    readonly edit: {
        readonly modal: {
            title(expenseTagName: string): string;

            readonly name: {
                readonly label: string;
                readonly error: {
                    readonly required: string;
                }
            };

            readonly color: {
                readonly label: string;
                readonly error: {
                    readonly required: string;
                }
            };

            readonly message: string;
            readonly confirmButtonLabel: string;
            readonly cancelButtonLabel: string;
        }

        readonly errors: {
            readonly notEditable: string;
            readonly notFound: string;
            readonly invalidEtag: string;
            readonly targetNotReady: string;
        }
    }

    readonly remove: {
        readonly modal: {
            title(expenseTagName: string): string;

            readonly message: string;
            readonly confirmButtonLabel: string;
            readonly cancelButtonLabel: string;
        }

        readonly errors: {
            readonly notEditable: string;
            readonly notFound: string;
            readonly invalidEtag: string;
        }
    }
}

export interface IAboutTranslationLabels {
    readonly title: string;
    readonly titleGuest: string;
    readonly skit: string;
    readonly description: string;
    readonly trackingNotification: string;
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