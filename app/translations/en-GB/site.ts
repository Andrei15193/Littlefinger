import type { ISiteTranslationTabels } from "../Translation";

export const siteTranslationLabels: ISiteTranslationTabels = {
    title: "Littlefinger",
    headerSubtitle: "_master of coin_",
    logExpenseButtonLabel: "Log expense",
    loginButtonLabel: "Sing in",
    registerButtonLabel: "Create account",
    logoutButtonLabel: "Logout",

    environments: {
        development: {
            name: "Development",
            description: "This is a development environment used for implementing new features and fixing bugs."
        },

        test: {
            name: "Test",
            description: "This is an environment used for testing, it contains intermediary states before a release is made and data is occasionally purged. Use only to try things out."
        }
    },

    userFlowTitles: {
        signIn: "Sign In",
        signUp: "Sign Up",
        passwordReset: "Recover Account"
    },

    tabs: {
        home: "Home",
        expenses: "Expenses",
        about: "About"
    },

    footerSubtitle: "__Littlefinger__, _book keeper_"
};