import * as vscode from 'vscode';

import { ColorMatch } from './color_extractor';

import AlphaDisplay from './displays/alpha_display';
import CmykDisplay from './displays/cmyk_display';
import HexDisplay from './displays/hex_display';
import HslDisplay from './displays/hsl_display';
import HsvDisplay from './displays/hsv_display';
import LabDisplay from './displays/lab_display';
import LchDisplay from './displays/lch_display';
import NameDisplay from './displays/name_display';
import { Preview, PreviewSquare, PreviewSquareXL, PreviewXL } from './displays/preview_display';
import RgbDisplay from './displays/rgb_display';

export interface ColorValueDisplay {
    name: string;
    display(colorMatch: ColorMatch): string | null;
}

type DisplayRegistry = Map<string, ColorValueDisplay>;

const allFields: DisplayRegistry = [
    Preview, PreviewXL, PreviewSquare, PreviewSquareXL,
    RgbDisplay,
    HslDisplay,
    HsvDisplay,
    CmykDisplay,
    LabDisplay,
    LchDisplay,
    AlphaDisplay,
    HexDisplay,
    NameDisplay,
].reduce((p, display) => {
    p.set(display.name, display);
    return p;
}, new Map());

const defaultFields = [
    Preview.name,
    RgbDisplay.name,
    HslDisplay.name,
    CmykDisplay.name,
    HexDisplay.name,
    AlphaDisplay.name,
];

/**
 * Normalize the name of a color field
 */
const normalizeFieldName = (name: string) =>
    ('' + name).toLowerCase();

export class ColorDisplay {
    private _config: vscode.WorkspaceConfiguration;

    constructor(config: vscode.WorkspaceConfiguration) {
        this._config = config;
    }

    public display(colorMatch: ColorMatch): string | null {
        const display = this.getDisplay(colorMatch);
        if (display && display.length) {
            return display;
        }
        return null;
    }

    private getDisplays(): ColorValueDisplay[] {
        let fields = (this._config.get<string[]>('fields') || defaultFields).map(normalizeFieldName);
        const excluded = (this._config.get<string[]>('excludedFields') || []).map(normalizeFieldName);

        fields = fields.filter((name) => excluded.indexOf(name) === -1);

        return fields
            .map((x) => allFields.get(x))
            .filter((x) => x) as ColorValueDisplay[];
    }

    private getDisplay(match: ColorMatch): string {
        return this.getDisplays().map((x) => x.display(match))
            .filter((x) => x && x.length > 0)
            .join('\n\n');
    }
}
