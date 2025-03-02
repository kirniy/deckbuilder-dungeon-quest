precision mediump float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
varying vec2 v_uv;

// Constants
#define PI 3.14159265359
#define GREEN vec3(0.0, 0.5, 0.2)
#define DARK_GREEN vec3(0.0, 0.3, 0.1)
#define GOLD vec3(0.8, 0.7, 0.2)
#define RED vec3(0.8, 0.1, 0.1)
#define WHITE vec3(0.9)
#define BLACK vec3(0.05)

// Random and noise functions
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Dithering function
float dither(vec2 uv, float brightness) {
    float grid_size = 8.0;
    vec2 grid_uv = floor(uv * grid_size);
    float threshold = random(grid_uv) * 0.8 + 0.1;
    return brightness > threshold ? 1.0 : 0.0;
}

// Linen texture
float linen(vec2 uv, float scale) {
    vec2 st = uv * scale;
    float n = noise(st * 5.0) * 0.5 + 0.5;
    float lines1 = sin(st.x * 50.0) * 0.5 + 0.5;
    float lines2 = sin(st.y * 50.0) * 0.5 + 0.5;
    return mix(n, mix(lines1, lines2, 0.5), 0.2);
}

// Draw a card
vec4 drawCard(vec2 uv, vec2 pos, vec2 size, vec3 color) {
    vec2 cardUv = (uv - pos) / size;
    if (cardUv.x >= 0.0 && cardUv.x <= 1.0 && cardUv.y >= 0.0 && cardUv.y <= 1.0) {
        // Card border
        if (cardUv.x < 0.05 || cardUv.x > 0.95 || cardUv.y < 0.05 || cardUv.y > 0.95) {
            return vec4(BLACK, 1.0);
        }
        
        // Card face
        if (cardUv.x < 0.2 && cardUv.y < 0.2) {
            return vec4(color, 1.0); // Card symbol in corner
        }
        if (cardUv.x > 0.8 && cardUv.y > 0.8) {
            return vec4(color, 1.0); // Card symbol in corner
        }
        
        // Card center symbol
        float dist = length((cardUv - vec2(0.5)) * vec2(1.0, 1.5));
        if (dist < 0.2) {
            return vec4(color, 1.0);
        }
        
        return vec4(WHITE, 1.0);
    }
    return vec4(0.0);
}

// Draw a chip
vec4 drawChip(vec2 uv, vec2 pos, float radius, vec3 color) {
    float dist = length(uv - pos);
    if (dist < radius) {
        // Chip edge
        if (dist > radius * 0.85) {
            float angle = atan(uv.y - pos.y, uv.x - pos.x);
            float stripes = step(0.5, fract((angle * 10.0) / PI));
            return vec4(mix(color, WHITE, stripes * 0.5), 1.0);
        }
        
        // Chip inner circle
        if (dist < radius * 0.7) {
            float noise_val = noise((uv - pos) * 50.0) * 0.1;
            return vec4(color * (0.9 + noise_val), 1.0);
        }
        
        return vec4(mix(color, BLACK, 0.3), 1.0);
    }
    return vec4(0.0);
}

void main() {
    // Correct aspect ratio
    vec2 uv = v_uv;
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x *= aspectRatio;
    
    // Mouse interaction
    vec2 mouse = u_mouse;
    mouse.x *= aspectRatio;
    float mouseInfluence = 0.1 / (length(uv - mouse) + 0.1);
    
    // Grid
    vec2 grid = fract(uv * 4.0 + sin(u_time * 0.2) * 0.05);
    float gridLines = step(0.95, max(grid.x, grid.y));
    
    // Linen background texture
    float linenTex = linen(uv + vec2(sin(u_time * 0.1), cos(u_time * 0.1)) * 0.1, 10.0);
    vec3 linenColor = mix(GREEN, DARK_GREEN, linenTex);
    
    // Add grid lines
    vec3 bgColor = mix(linenColor, GOLD * 0.5, gridLines * 0.3);
    
    // Apply dithering to background
    float ditheredBg = dither(v_uv * u_resolution, length(bgColor) / 1.732);
    bgColor = mix(BLACK, GREEN, ditheredBg);
    
    // Initialize final color with background
    vec4 finalColor = vec4(bgColor, 1.0);
    
    // Draw cards
    for (int i = 0; i < 4; i++) {
        float offset = float(i) * 0.5;
        vec2 cardPos = vec2(
            0.5 + cos(u_time * 0.2 + offset) * 0.3 + sin(u_time * 0.1) * 0.1,
            0.5 + sin(u_time * 0.3 + offset) * 0.2 + cos(u_time * 0.15) * 0.1
        );
        
        // Apply mouse influence
        cardPos = mix(cardPos, mouse, mouseInfluence * 0.3);
        
        vec3 cardColor = (i % 2 == 0) ? RED : BLACK;
        vec4 card = drawCard(uv, cardPos, vec2(0.15, 0.2), cardColor);
        
        // Blend card with background
        finalColor = mix(finalColor, card, card.a);
    }
    
    // Draw chips
    for (int i = 0; i < 6; i++) {
        float angle = float(i) / 6.0 * PI * 2.0 + u_time * 0.1;
        float radius = 0.1 + float(i % 3) * 0.02;
        vec2 chipPos = vec2(
            0.5 + cos(angle + u_time * 0.3) * 0.4,
            0.5 + sin(angle + u_time * 0.2) * 0.3
        );
        
        // Apply mouse influence
        chipPos = mix(chipPos, mouse, mouseInfluence * 0.2);
        
        vec3 chipColor;
        if (i % 3 == 0) chipColor = RED;
        else if (i % 3 == 1) chipColor = GOLD;
        else chipColor = vec3(0.1, 0.1, 0.8); // Blue
        
        vec4 chip = drawChip(uv, chipPos, 0.08, chipColor);
        
        // Blend chip with current result
        finalColor = mix(finalColor, chip, chip.a);
    }
    
    // Add 90s style scanlines
    float scanline = sin(v_uv.y * u_resolution.y * 0.5) * 0.5 + 0.5;
    finalColor.rgb *= 0.9 + scanline * 0.1;
    
    // Add a subtle vignette effect
    float vignette = 1.0 - length((v_uv - 0.5) * 1.5);
    vignette = smoothstep(0.0, 0.6, vignette);
    finalColor.rgb *= vignette;
    
    // Final dithering for that 90s look
    vec3 dithered;
    dithered.r = dither(v_uv * u_resolution, finalColor.r);
    dithered.g = dither(v_uv * u_resolution + vec2(1.0), finalColor.g);
    dithered.b = dither(v_uv * u_resolution + vec2(2.0), finalColor.b);
    
    // Mix original with dithered for a more authentic 90s feel
    finalColor.rgb = mix(finalColor.rgb, dithered, 0.7);
    
    gl_FragColor = finalColor;
    
    #include <colorspace_fragment>
}
```