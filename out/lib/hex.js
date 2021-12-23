"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HexToDecTransformer {
    get label() {
        return "Hex to Dec";
    }
    get description() {
        return this.label;
    }
    check(input) {
        return true;
    }
    transform(input) {
				if (input.length % 2) {
						input = '0' + input;
				}
        var buffer = parseInt(input, 16);
        var output = buffer.toString(10);
        return output;
    }
}
exports.HexToDecTransformer = HexToDecTransformer;

class DecToHexTransformer {
    get label() {
        return "Dec to Hex";
    }
    get description() {
        return this.label;
    }
    check(input) {
        return true;
    }
    transform(input) {
				if (input.length % 2) {
						input = '0' + input;
				}
        var buffer = parseInt(input, 10);
        var output = buffer.toString(16).toUpperCase();
        return output;
    }
}
exports.DecToHexTransformer = DecToHexTransformer;
//# sourceMappingURL=hex.js.map