export default `
float round(float value) {
    return floor(value + 0.5);
}

float cutoffRound(float value, float place) {
    return float(round(value / place)) * place;
}

vec2 cutoffRound(vec2 value, float place) {
    return vec2(
        cutoffRound(value.x, place),
        cutoffRound(value.y, place)
    );
}

vec3 cutoffRound(vec3 value, float place) {
    return vec3(
        cutoffRound(value.x, place),
        cutoffRound(value.y, place),
        cutoffRound(value.z, place)
    );
}

vec4 cutoffRound(vec4 value, float place) {
    return vec4(
        cutoffRound(value.x, place),
        cutoffRound(value.y, place),
        cutoffRound(value.z, place),
        cutoffRound(value.w, place)
    );
}

float clampToOne(float value) {
    return min(1.0, max(0.0, value));
}

float twoSidedCurve(float value, float offset, float width) {
    float wideOffset = 1.0 / (1.0 + (1.0 / width));
    float x = clampToOne((value / width) + 1.0 - (offset / wideOffset));
    float y = (sin(PI_2 * (x - 0.25)) + 1.0) / 2.0;
    return y;
}

float oneSidedCurve(float value, float offset, float width) {
    float y = twoSidedCurve(value, offset, width);
    return (offset * (1.0 + width)) - (width / 2.0) >= value ? 1.0 : y;
}
`
