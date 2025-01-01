"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanPassword = void 0;
// clean password before returning response
const cleanPassword = (object) => {
    const copy = object.toObject();
    if ('password' in object) {
        delete copy.password;
    }
    ;
    return copy;
};
exports.cleanPassword = cleanPassword;
