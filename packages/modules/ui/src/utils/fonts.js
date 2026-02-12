export const formatFonts = (families, defaultWeights = [400]) => {
    const formatted = [];
    for (const font in families) {
        const formattedFont = font.replace(/ /g, '+'); // Replace spaces with '+'
        const weights = families[font];
        if (weights === true) {
            for (const weight of defaultWeights) {
                formatted.push(`${formattedFont}:${weight}`);
            }
        }
        else if (Array.isArray(weights)) {
            for (const weight of weights) {
                formatted.push(`${formattedFont}:${weight}`);
            }
        }
    }
    return formatted;
};
