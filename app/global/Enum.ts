export class Enum {
    public static isDefined<TEnum>(enumeration: EnumType<TEnum>, value: TEnum): boolean {
        return typeof value === "number" && enumeration[value as number] !== undefined;
    }

    public static hasKey<TEnum>(enumeration: EnumType<TEnum>, key: string): boolean {
        return enumeration[key] !== undefined;
    }

    public static getKey<TEnum>(enumeration: EnumType<TEnum>, value: TEnum): string | undefined {
        if (typeof value !== "number" || enumeration[value] === undefined)
            throw new Error(`The value '${value}' is not contained by the enum.`);

        return enumeration[value as number] as string;
    }

    public static hasValue<TEnum>(enumeration: EnumType<TEnum>, value: TEnum): boolean {
        return typeof value === "number" && enumeration[value] !== undefined;
    }

    public static getValue<TEnum>(enumeration: EnumType<TEnum>, key: string): TEnum {
        if (enumeration[key] === undefined)
            throw new Error(`The key '${key}' is not defined by the enum.`);

        return enumeration[key] as TEnum;
    }

    public static getAllKeys<TEnum>(enumeration: EnumType<TEnum>): readonly string[] {
        return Object
            .values(enumeration)
            .filter(key => typeof key === "string") as readonly string[];
    }

    public static getAllValues<TEnum>(enumeration: EnumType<TEnum>): readonly TEnum[] {
        return Object
            .values(enumeration)
            .filter(key => typeof key === "number") as readonly TEnum[];
    }
}

type EnumType<TEnum> = { [s: number | string]: string | TEnum };