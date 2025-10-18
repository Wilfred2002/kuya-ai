'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Configuration
    const WAVE_SEGMENTS = 128;
    const WAVE_SIZE = 800;

    // Setup scene
    const scene = new THREE.Scene();

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 200, 400);
    camera.lookAt(0, 0, 0);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create fluid wave plane with custom shader
    const geometry = new THREE.PlaneGeometry(
      WAVE_SIZE,
      WAVE_SIZE,
      WAVE_SEGMENTS,
      WAVE_SEGMENTS
    );

    // Custom vertex shader for wave animation
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseStrength;

      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;

        vec3 pos = position;

        // Base wave motion
        float wave1 = sin(pos.x * 0.01 + uTime * 0.5) * 15.0;
        float wave2 = sin(pos.y * 0.01 + uTime * 0.3) * 15.0;
        float wave3 = sin((pos.x + pos.y) * 0.008 + uTime * 0.7) * 10.0;

        // Mouse ripple effect
        vec2 mousePos = uMouse * 400.0; // Scale to world coordinates
        float distanceToMouse = distance(pos.xy, mousePos);
        float ripple = sin(distanceToMouse * 0.05 - uTime * 3.0) * uMouseStrength;
        ripple *= smoothstep(300.0, 0.0, distanceToMouse);

        // Combine waves
        pos.z = wave1 + wave2 + wave3 + ripple * 30.0;

        vElevation = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    // Custom fragment shader for color gradient
    const fragmentShader = `
      uniform float uTime;

      varying vec2 vUv;
      varying float vElevation;

      void main() {
        // Matcha green color palette
        vec3 colorLow = vec3(0.35, 0.62, 0.30);    // #5a9e4d
        vec3 colorMid = vec3(0.49, 0.72, 0.43);    // #7cb96d
        vec3 colorHigh = vec3(0.54, 0.72, 0.52);   // #8bb885

        // Map elevation to color
        float mixStrength = (vElevation + 30.0) / 60.0;
        mixStrength = clamp(mixStrength, 0.0, 1.0);

        vec3 color = mix(colorLow, colorHigh, mixStrength);

        // Add subtle shimmer based on UV and time
        float shimmer = sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 - uTime) * 0.05;
        color += shimmer;

        // Fade edges
        float alpha = 1.0 - smoothstep(0.3, 1.0, length(vUv - 0.5) * 2.0);
        alpha = clamp(alpha, 0.2, 0.95);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseStrength: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 3; // Tilt the plane
    scene.add(mesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8bb885, 1, 1000);
    pointLight.position.set(0, 200, 100);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 0.5);
    scene.add(directionalLight);

    // Mouse tracking
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    let mouseStrength = 0;

    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouseStrength = 1.0; // Activate ripple on mouse move
    };

    const handleMouseLeave = () => {
      mouseStrength = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.1;
      mouse.y += (targetMouse.y - mouse.y) * 0.1;

      // Decay mouse strength
      mouseStrength *= 0.95;

      // Update shader uniforms
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uMouse.value.copy(mouse);
      material.uniforms.uMouseStrength.value = mouseStrength;

      // Gentle camera sway
      camera.position.x = Math.sin(elapsedTime * 0.1) * 50 + mouse.x * 30;
      camera.position.y = 200 + Math.cos(elapsedTime * 0.15) * 20 + mouse.y * 30;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
