/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Converts RGB color values to a single numeric value.
 * @param r Red component (0-255).
 * @param g Green component (0-255).
 * @param b Blue component (0-255).
 * @returns A numeric representation of the RGB color.
 */
function rgb(r: number, g: number, b: number): number {
    return (r << 16) + (g << 8) + b
}

const colors = {
    // Ayios colors
    theme:            rgb(88, 101, 242),
    themeDark:        rgb(74, 85, 203),
    alpha:            rgb(237, 66, 69),
    beta:             rgb(18, 189, 186),
    development:      rgb(5, 150, 255),
    premium:          rgb(255, 190, 61),

    // General colors
    fuchsia:          rgb(235, 69, 158),
    green:            rgb(87, 242, 135),
    aqua:             rgb(26,188,156),
    black:            rgb(1, 1, 1),
    darkLightBlue:    rgb(42, 114, 199),
    red:              rgb(237, 66, 69),
    blue:             rgb(54, 82, 109),
    blurple:          rgb(88,101,242),
    brightGold:       rgb(241,196,15),
    coral:            rgb(240, 128, 128),
    darkAqua:         rgb(0, 139, 139),
    darkBlue:         rgb(32,102,148),
    darkButNotBlack:  rgb(44,47,51),
    darkerGrey:       rgb(127,140,141),
    darkGold:         rgb(194,124,14),
    darkGreen:        rgb(17, 128, 106),
    greenDark:        rgb(1, 136, 91),
    forestGreen:      rgb(31,139,76),
    darkGrey:         rgb(50, 50, 50),
    darkNavy:         rgb(44,62,80),
    darkOrange:       rgb(168,67,0),
    darkPurple:       rgb(113,54,138),
    darkRed:          rgb(153,45,34),
    darkVividPink:    rgb(173,20,87),
    orange:           rgb(194, 125, 14),
    discordSuccess:   rgb(67, 173, 127),
    dodgerBlue:       rgb(30, 144, 255),
    embedGrey:        rgb(43, 45, 49),
    gold:             rgb(249, 166, 2),
    grey:             rgb(128, 128, 128),
    greyple:          rgb(153,170,181),
    lightBlack:       rgb(34, 34, 34),
    lightBlue:        rgb(70, 130, 180),
    lightBlue2:       rgb(52,152,219),
    lightGreen:       rgb(26, 188, 156),
    lightGrey:        rgb(188,192,192),
    limeGreen:        rgb(46, 204, 113),
    luminousVividPink:rgb(233,30,99),
    maroon:           rgb(128, 0, 0),
    metallicGold:     rgb(212, 175, 55),
    navy:             rgb(52,73,94),
    notQuiteBlack:    rgb(35,39,42),
    lightOrange:      rgb(230, 126, 34),
    purple:           rgb(155,89,182),
    white:            rgb(255,255,255),
    yellow:           rgb(254, 231, 92),
}

//> THE CODE BELOW (particularly "resolveColor" and potentially its comment) is under MIT license by discord.js (ColorResolvable)
/**
 * Resolve a color. Default/error is color.black. Allows "random" (rand color) or "default" (black)
 * @important Pass the generic <string> to remove strict typing for the parameter `color`.
 * @param color The color to resolve
 * @returns A color (black or the input color) as a number
 */
function resolveColor<
    StringType = keyof typeof colors
>(
    color: StringType | number | number[]
): number {
    try {
        let resolvedColor;

        if (typeof color === 'string') {
            if (color.toLowerCase() === 'random') {
                return Math.floor(Math.random() * (0xffffff + 1));
            }
            if (color.toLowerCase() === 'default') {
                return 0;
            }
            if (/^#?[\da-f]{6}$/i.test(color)) {
                return parseInt(
                    color.replace('#', ''),
                    16
                );
            }
            resolvedColor = colors[color as keyof typeof colors];
        } else if (Array.isArray(color)) {
            resolvedColor =
                (color[0] << 16)
                + (color[1] << 8)
                + color[2];
        } else {
            resolvedColor = color;
        }

        if (!Number.isInteger(resolvedColor)) {
            return colors.black;
        }
        if ((resolvedColor as number < 0) || (resolvedColor as number > 0xffffff)) {
            return colors.black;
        }
        return resolvedColor as number;
    } catch {
        return colors.black;
    }
  }

/**
 * Gets a list of all available color names.
 * @returns An array of color name strings.
 */
function getColorList(): string[] {
    return Object.keys(colors);
}

/** Determine a color (string) based off of its value */
function determineColorFromNumber(colorNum: number): string | undefined {
    for (const color of Object.keys(colors)) {
        if (colors[color as keyof typeof colors] === colorNum) {
            return color;
        }
    }

    return undefined;
}

export default {
    list: colors,
    keys: getColorList,
    fromString: resolveColor,
    fromNumber: determineColorFromNumber,

    theme: colors.theme,
    themeDark: colors.themeDark,
    alpha: colors.alpha,
    beta: colors.beta,
    development: colors.development,
    premium: colors.premium
}