precision mediump float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
varying vec2 v_uv;

//
// Helper function: 2D dithering noise
//
float dither(vec2 pos) {
  return fract(sin(dot(pos, vec2(12.9898,78.233))) * 43758.5453);
}

//
// Helper: SDF for circle shape
//
float circleSDF(vec2 st, vec2 center, float radius) {
  return length(st - center) - radius;
}

//
// Helper: SDF for a rectangle with rounded corners
//
float rectSDF(vec2 st, vec2 center, vec2 size, float radius) {
  vec2 d = abs(st - center) - size;
  float insideDistance = min(max(d.x, d.y), 0.0);
  float outsideDistance = length(max(d, 0.0));
  return insideDistance + outsideDistance - radius;
}

//
// Helper: grid lines function
//
float grid(vec2 st, float res) {
  vec2 gridUV = st * res;
  vec2 f = fract(gridUV);
  // Compute smooth grid line based on fwidth
  vec2 line = abs(f - 0.5) / fwidth(gridUV);
  float gridLine = 1.0 - smoothstep(0.0, 1.0, min(line.x, line.y));
  return gridLine;
}

void main() {
  // Correct UV for aspect ratio
  vec2 st = v_uv;
  st = (st - 0.5) * u_resolution.xy / min(u_resolution.x, u_resolution.y) + 0.5;
  
  // Define a color palette
  vec3 bgColor    = vec3(0.15, 0.35, 0.15);   // green linen background
  vec3 gridColor  = vec3(0.0, 0.0, 0.0);        // black grid lines
  vec3 chipColor  = vec3(0.8, 0.1, 0.1);        // red casino chip
  vec3 cardColor  = vec3(1.0, 1.0, 1.0);        // white playing card
  
  // Mouse interaction factor (affects chip/card size subtly)
  float mouseEffect = 0.02 * u_mouse.x;
  
  // Global grid (simulate a casino table grid)
  float globalGrid = grid(st, 10.0);
  
  // Work in a repeating cell space for chips and cards.
  float gridRes = 10.0;
  vec2 cellUV = fract(st * gridRes);
  
  // Draw a chip shape (circle) in each cell at an offset position.
  float chipSDF = circleSDF(cellUV, vec2(0.3, 0.3), 0.12 + mouseEffect);
  float chip = 1.0 - smoothstep(0.0, 0.01, chipSDF);
  
  // Draw a card shape (rounded rectangle) in each cell at another position.
  float cardSDF = rectSDF(cellUV, vec2(0.7, 0.7), vec2(0.15, 0.2), 0.03 + mouseEffect);
  float card = 1.0 - smoothstep(0.0, 0.01, cardSDF);
  
  // Combine the elements using layering:
  vec3 color = bgColor;
  
  // Overlay grid lines with a subtle darkening effect.
  color = mix(color, gridColor, globalGrid * 0.3);
  
  // Add chip and card shapes.
  color = mix(color, chipColor, chip);
  color = mix(color, cardColor, card * 0.7);
  
  // Add a subtle dither effect for the 90s flat style look.
  float noise = (dither(v_uv * u_resolution) - 0.5) * 0.05;
  color += noise;
  
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}