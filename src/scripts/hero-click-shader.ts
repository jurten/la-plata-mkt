// Shared by the text and atmosphere so both waves have the same pixel scale.
export const heroClickShader = `
uniform vec4 uClicks[4];
vec3 clickShock(vec2 uv, vec2 resolution, float referenceHeight) {
  vec2 shock = vec2(0.0);
  float light = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 click = uClicks[i];
    if (click.w <= 0.0) continue;
    vec2 delta = (uv - click.xy) * resolution / referenceHeight;
    float dist = length(delta);
    float age = click.z;
    float offset = (dist - age * 0.9) / (0.06 + age * 0.06);
    float fade = 1.0 - smoothstep(0.0, 1.6, age);
    float energy = exp(-offset * offset) * fade * smoothstep(0.0, 0.08, age) * click.w;
    vec2 dir = dist > 0.0001 ? delta / dist : vec2(0.0);
    shock -= dir * offset * energy * 0.09 * referenceHeight / resolution;
    light += energy;
  }
  return vec3(shock, light);
}
`;
