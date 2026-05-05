export function getStringParam(param: string | string[] | undefined, name: string): string {
    if (!param) {
        throw new Error(`${name} manquant`);
    }
    if (Array.isArray(param)) {
        const firstValue = param[0];

        if (!firstValue) {
            throw new Error(`${name} manquant`);
        }
        return firstValue
    }
    return param;
}