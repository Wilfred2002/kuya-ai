'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    lines: THREE.LineSegments;
    particlePositions: Float32Array;
    linePositions: Float32Array;
    particleCount: number;
    mouse: THREE.Vector2;
    animationId: number | null;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Configuration
    const PARTICLE_COUNT = 150;
    const MAX_PARTICLE_DISTANCE = 150;
    const PARTICLE_SIZE = 2.5;
    const BASE_COLOR = 0x5a9e4d; // Matcha green
    const GLOW_COLOR = 0x8bb885; // Light matcha
    const CONNECTION_COLOR = 0x7cb96d;

    // Setup scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfafdf8, 0.0008);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 400;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create particle system
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

    // Initialize particles with random positions and velocities
    for (let i = 0; i < PARTICLE_COUNT * 3; i += 3) {
      particlePositions[i] = Math.random() * 800 - 400;
      particlePositions[i + 1] = Math.random() * 800 - 400;
      particlePositions[i + 2] = Math.random() * 800 - 400;

      particleVelocities[i] = (Math.random() - 0.5) * 0.2;
      particleVelocities[i + 1] = (Math.random() - 0.5) * 0.2;
      particleVelocities[i + 2] = (Math.random() - 0.5) * 0.2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Particle material with glow effect
    const particleMaterial = new THREE.PointsMaterial({
      color: BASE_COLOR,
      size: PARTICLE_SIZE,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Create connection lines between particles
    const maxConnections = PARTICLE_COUNT * PARTICLE_COUNT;
    const linePositions = new Float32Array(maxConnections * 3);
    const lineColors = new Float32Array(maxConnections * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage)
    );
    lineGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Add ambient light for subtle glow
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Add point light that follows mouse
    const pointLight = new THREE.PointLight(GLOW_COLOR, 1, 500);
    pointLight.position.set(0, 0, 100);
    scene.add(pointLight);

    // Mouse tracking
    const mouse = new THREE.Vector2(0, 0);
    const mouseInfluence = new THREE.Vector3();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update light position based on mouse
      mouseInfluence.set(
        mouse.x * 300,
        mouse.y * 300,
        100
      );
      pointLight.position.lerp(mouseInfluence, 0.1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Update particle positions
      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;

      for (let i = 0; i < PARTICLE_COUNT * 3; i += 3) {
        // Apply gentle drift
        particlePositions[i] += particleVelocities[i];
        particlePositions[i + 1] += particleVelocities[i + 1];
        particlePositions[i + 2] += particleVelocities[i + 2];

        // Mouse influence - particles are attracted to cursor
        const dx = mouseInfluence.x - particlePositions[i];
        const dy = mouseInfluence.y - particlePositions[i + 1];
        const dz = mouseInfluence.z - particlePositions[i + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 200) {
          const force = (200 - distance) / 200;
          particlePositions[i] += dx * force * 0.02;
          particlePositions[i + 1] += dy * force * 0.02;
          particlePositions[i + 2] += dz * force * 0.02;
        }

        // Boundary check - wrap around
        if (particlePositions[i] < -400 || particlePositions[i] > 400)
          particleVelocities[i] = -particleVelocities[i];
        if (particlePositions[i + 1] < -400 || particlePositions[i + 1] > 400)
          particleVelocities[i + 1] = -particleVelocities[i + 1];
        if (particlePositions[i + 2] < -400 || particlePositions[i + 2] > 400)
          particleVelocities[i + 2] = -particleVelocities[i + 2];
      }

      // Update connections between nearby particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const dx = particlePositions[i * 3] - particlePositions[j * 3];
          const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
          const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < MAX_PARTICLE_DISTANCE) {
            const alpha = 1.0 - distance / MAX_PARTICLE_DISTANCE;

            linePositions[vertexpos++] = particlePositions[i * 3];
            linePositions[vertexpos++] = particlePositions[i * 3 + 1];
            linePositions[vertexpos++] = particlePositions[i * 3 + 2];

            linePositions[vertexpos++] = particlePositions[j * 3];
            linePositions[vertexpos++] = particlePositions[j * 3 + 1];
            linePositions[vertexpos++] = particlePositions[j * 3 + 2];

            // Color based on distance (brighter when closer)
            const color = new THREE.Color(CONNECTION_COLOR);
            color.multiplyScalar(alpha);

            lineColors[colorpos++] = color.r;
            lineColors[colorpos++] = color.g;
            lineColors[colorpos++] = color.b;

            lineColors[colorpos++] = color.r;
            lineColors[colorpos++] = color.g;
            lineColors[colorpos++] = color.b;

            numConnected++;
          }
        }
      }

      lineGeometry.setDrawRange(0, numConnected * 2);
      particleGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Gentle camera rotation
      camera.position.x += (mouse.x * 50 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 50 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Store refs for cleanup
    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      lines,
      particlePositions,
      linePositions,
      particleCount: PARTICLE_COUNT,
      mouse,
      animationId,
    };

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
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
