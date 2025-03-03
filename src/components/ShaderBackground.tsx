import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ShaderBackgroundProps {
  className?: string;
  shaderPath?: string; // Add prop to specify which shader file to use
}

// Export the available shader paths for use elsewhere
export const ShaderOptions = {
  DEFAULT: '/shader.glsl',
  SHADER2: '/shader2.glsl', 
  SHADER3: '/shader3.glsl'
};

const ShaderBackground = ({ className = '', shaderPath = ShaderOptions.DEFAULT }: ShaderBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 1;
    
    // Create renderer with alpha enabled
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Set initial size
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
    };
    updateSize();
    
    // Append renderer
    containerRef.current.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', updateSize);
    
    // Mouse tracking for shader
    const mouse = new THREE.Vector2(0.5, 0.5);
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = 1 - (event.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Touch tracking for mobile
    const handleTouch = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX / window.innerWidth;
        mouse.y = 1 - (event.touches[0].clientY / window.innerHeight);
        event.preventDefault();
      }
    };
    window.addEventListener('touchmove', handleTouch, { passive: false });
    
    // Define the shader uniforms
    const uniforms = {
      u_time: { value: 0 },
      u_mouse: { value: mouse },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };
    
    // Load the specified shader file
    let shaderMaterial: THREE.ShaderMaterial | null = null;
    let mesh: THREE.Mesh | null = null;
    
    fetch(shaderPath)
      .then(response => response.text())
      .then(shaderCode => {
        // Clean the shader code
        const cleanShaderCode = shaderCode
          .replace(/```glsl/g, '')
          .replace(/```/g, '')
          .replace(/varying vec2 v_uv;/g, '')
          .replace(/uniform float u_time;/g, '')
          .replace(/uniform vec2 u_mouse;/g, '')
          .replace(/uniform vec2 u_resolution;/g, '');
        
        // Create the final shader code
        const finalShaderCode = `
          varying vec2 v_uv;
          
          uniform float u_time;
          uniform vec2 u_mouse;
          uniform vec2 u_resolution;
          
          ${cleanShaderCode}
        `;
        
        // Create the shader material
        shaderMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: `
            varying vec2 v_uv;
            
            void main() {
              v_uv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: finalShaderCode,
          transparent: false
        });
        
        // Create and add the mesh to the scene
        const geometry = new THREE.PlaneGeometry(2, 2);
        mesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mesh);
      })
      .catch(error => {
        console.error("Error loading shader:", error);
        
        // Create a fallback shader if loading fails
        shaderMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: `
            varying vec2 v_uv;
            
            void main() {
              v_uv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 v_uv;
            
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec2 u_resolution;
            
            void main() {
              // Create a highly visible pattern
              vec2 uv = v_uv;
              
              // Background color (dark green)
              vec3 color = vec3(0.0, 0.3, 0.1);
              
              // Add grid pattern
              vec2 grid = fract(uv * 20.0);
              float line = step(0.95, max(grid.x, grid.y));
              color = mix(color, vec3(0.8, 0.7, 0.2), line * 0.5); // Gold grid lines
              
              // Add moving cards effect (bright spots)
              for (int i = 0; i < 5; i++) {
                float t = u_time * 0.5 + float(i) * 1.0;
                vec2 center = vec2(
                  0.5 + 0.3 * cos(t + float(i)),
                  0.5 + 0.3 * sin(t * 0.7 + float(i) * 0.5)
                );
                float dist = length(uv - center);
                float glow = 0.05 / (dist + 0.05);
                color += vec3(0.9, 0.8, 0.3) * glow * 0.5; // Bright yellow-gold glow
              }
              
              // Add mouse interaction
              float mouseEffect = 0.1 / (length(uv - u_mouse) + 0.1);
              color += vec3(0.8, 0.2, 0.2) * mouseEffect * 0.5; // Red glow around mouse
              
              // Ensure color has opacity 1.0 (fully visible)
              gl_FragColor = vec4(color, 1.0);
            }
          `,
          transparent: false
        });
        
        // Create and add the mesh to the scene
        const geometry = new THREE.PlaneGeometry(2, 2);
        mesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mesh);
      });
    
    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016; // Approximately 60fps
      
      if (shaderMaterial) {
        shaderMaterial.uniforms.u_time.value = time;
        shaderMaterial.uniforms.u_mouse.value = mouse;
        shaderMaterial.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      // Remove event listeners
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouch);
      
      // Dispose ThreeJS resources
      if (shaderMaterial) {
        shaderMaterial.dispose();
      }
      if (mesh && mesh.geometry) {
        mesh.geometry.dispose();
      }
      renderer.dispose();
      
      // Remove canvas
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [shaderPath]); // Re-run effect when shaderPath changes

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none', // Allow click-through
      }}
    />
  );
};

export default ShaderBackground; 