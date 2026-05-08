import { ParsedQs } from "qs";

type QueryParam =
    | string
    | ParsedQs
    | (string | ParsedQs)[]
    | undefined;

export function getStringParam(
    param: QueryParam,
    name: string
): string {
    if (!param) {
        throw new Error(`${name} manquant`);
    }

    if (Array.isArray(param)) {
        const firstValue = param[0];

        if (typeof firstValue !== "string") {
            throw new Error(`${name} invalide`);
        }

        return firstValue;
    }

    if (typeof param !== "string") {
        throw new Error(`${name} invalide`);
    }

    return param;
}