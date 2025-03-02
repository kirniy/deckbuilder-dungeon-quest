```glsl
precision mediump float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
varying vec2 v_uv;

#define PI 3.14159265359
#define GREEN vec3(0.0, 0.5, 0.2)
#define DARK_GREEN vec3(0.0, 0.3, 0.1)
#define GOLD vec3(0.8, 0.7, 0.2)
#define WHITE vec3(0.9, 0.9, 0.9)
#define BLACK vec3(0.05, 0.05, 0.05)

// Hash function for pseudo-random numbers
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Dithering pattern
float dither(vec2 uv, float brightness) {
    float bayer[16];
    bayer[0] = 0.0/16.0; bayer[1] = 8.0/16.0; bayer[2] = 2.0/16.0; bayer[3] = 10.0/16.0;
    bayer[4] = 12.0/16.0; bayer[5] = 4.0/16.0; bayer[6] = 14.0/16.0; bayer[7] = 6.0/16.0;
    bayer[8] = 3.0/16.0; bayer[9] = 11.0/16.0; bayer[10] = 1.0/16.0; bayer[11] = 9.0/16.0;
    bayer[12] = 15.0/16.0; bayer[13] = 7.0/16.0; bayer[14] = 13.0/16.0; bayer[15] = 5.0/16.0;
    
    int x = int(mod(uv.x * 100.0, 4.0));
    int y = int(mod(uv.y * 100.0, 4.0));
    int index = x + y * 4;
    
    return step(bayer[index], brightness);
}

// Grid pattern
float grid(vec2 uv, float size, float thickness) {
    vec2 grid = fract(uv * size);
    vec2 gridLines = smoothstep(0.0, thickness, grid) * smoothstep(thickness, 0.0, 1.0 - grid);
    return max(gridLines.x, gridLines.y);
}

// Casino chip
float chip(vec2 uv, vec2 center, float radius) {
    float dist = length(uv - center);
    float circle = smoothstep(radius, radius - 0.01, dist);
    
    // Inner circle pattern
    float innerCircle = smoothstep(radius * 0.8, radius * 0.79, dist);
    
    // Edge pattern
    float angle = atan(uv.y - center.y, uv.x - center.x);
    float edgePattern = step(0.5, fract((angle / PI + 1.0) * 10.0));
    float edge = smoothstep(radius, radius - 0.02, dist) - smoothstep(radius - 0.03, radius - 0.05, dist);
    
    return circle * (1.0 - (edge * edgePattern)) * (1.0 - innerCircle * 0.5);
}

// Linen texture
float linen(vec2 uv, float scale) {
    vec2 id = floor(uv * scale);
    float h = hash(id);
    return mix(0.85, 1.0, h);
}

void main() {
    // Adjust for aspect ratio
    vec2 uv = v_uv;
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x *= aspectRatio;
    
    // Mouse influence
    vec2 mousePos = u_mouse;
    mousePos.x *= aspectRatio;
    float mouseDist = length(uv - mousePos);
    float mouseInfluence = smoothstep(0.5, 0.0, mouseDist);
    
    // Animated grid
    float time = u_time * 0.2;
    vec2 gridUv = uv;
    gridUv.y += time; // Endless scrolling
    
    // Grid size increases near mouse
    float gridSize = 10.0 + mouseInfluence * 5.0;
    float gridThickness = 0.05 + mouseInfluence * 0.05;
    float gridPattern = grid(gridUv, gridSize, gridThickness);
    
    // Linen texture
    float linenTexture = linen(uv * 5.0, 50.0);
    
    // Background color with linen texture
    vec3 bgColor = GREEN * linenTexture;
    
    // Add some chips
    float chipPattern = 0.0;
    
    // Animated chips
    for (int i = 0; i < 5; i++) {
        float offset = float(i) * 0.2;
        vec2 chipCenter = vec2(
            fract(sin(float(i) * 78.233 + time) * 0.5 + 0.5) * aspectRatio,
            fract(cos(float(i) * 45.17 + time * 0.7) * 0.5 + 0.5 + time)
        );
        
        // Make chips larger near mouse
        float chipSize = 0.05 + 0.02 * mouseInfluence;
        chipPattern += chip(uv, chipCenter, chipSize);
    }
    
    // Combine elements
    vec3 color = mix(bgColor, GOLD, chipPattern);
    
    // Add grid lines
    color = mix(color, WHITE, gridPattern * 0.7);
    
    // Apply dithering for 90s effect
    float brightness = (color.r + color.g + color.b) / 3.0;
    float ditherPattern = dither(uv, brightness);
    color = mix(BLACK, color, ditherPattern);
    
    // Final color
    gl_FragColor = vec4(color, 1.0);
    
    #include <colorspace_fragment>
}
```