export interface ITAb {
    readonly path: string;
    readonly label: string;
    readonly disabled?: boolean;
}

const applicationTabs = {
    home: {
        path: "/",
        label: "Home"
    } as ITAb,
    expenses: {
        path: "/expenses",
        label: "Expenses"
    } as ITAb,
    about: {
        path: "/about",
        label: "About"
    } as ITAb
};

export const tabs = applicationTabs as { readonly [key in keyof typeof applicationTabs]: ITAb };