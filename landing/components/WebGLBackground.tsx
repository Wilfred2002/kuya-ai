'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.log('Container ref not available');
      return;
    }

    console.log('WebGL Background initializing...');
    console.log('Container element:', container);

    try {
      // Configuration for Neural Network Effect
    const MAX_NODES = 200;
    const MAX_CONNECTIONS = 100;
    const NODE_SIZE = 8;
    const CONNECTION_WIDTH = 2;
    const PULSE_SPEED = 0.02;
    const CONNECTION_DISTANCE = 150;

    // Setup scene
    const scene = new THREE.Scene();

    // Setup camera
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    camera.position.z = 500;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    console.log('Canvas added to DOM, size:', window.innerWidth, 'x', window.innerHeight);
    console.log('WebGL context:', renderer.getContext());
    console.log('Canvas element:', renderer.domElement);

    // Neural Network data structures
    interface NeuralNode {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      pulse: number; // 0 to 1, pulsing animation
      connections: number[]; // indices of connected nodes
      active: boolean;
    }

    interface Connection {
      from: number;
      to: number;
      strength: number; // 0 to 1
      dataFlow: number; // 0 to 1, flowing data animation
    }

    const nodes: NeuralNode[] = [];
    const connections: Connection[] = [];
    const mouse = new THREE.Vector2(0, 0);

    // Create geometry for neural nodes
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(MAX_NODES * 3);
    const nodeColors = new Float32Array(MAX_NODES * 3);
    const nodeSizes = new Float32Array(MAX_NODES);

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
    nodeGeometry.setAttribute('size', new THREE.BufferAttribute(nodeSizes, 1));

    // Create geometry for connections
    const connectionGeometry = new THREE.BufferGeometry();
    const connectionPositions = new Float32Array(MAX_CONNECTIONS * 6); // 2 points per line
    const connectionColors = new Float32Array(MAX_CONNECTIONS * 6);
    const connectionWidths = new Float32Array(MAX_CONNECTIONS);

    connectionGeometry.setAttribute('position', new THREE.BufferAttribute(connectionPositions, 3));
    connectionGeometry.setAttribute('color', new THREE.BufferAttribute(connectionColors, 3));
    connectionGeometry.setAttribute('width', new THREE.BufferAttribute(connectionWidths, 1));

    // Custom vertex shader for neural nodes
    const nodeVertexShader = `
      attribute float size;
      attribute vec3 color;

      varying vec3 vColor;
      varying float vPulse;

      void main() {
        vColor = color;
        vPulse = color.g; // Pulse is encoded in green channel

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Custom fragment shader for neural nodes
    const nodeFragmentShader = `
      varying vec3 vColor;
      varying float vPulse;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        // Neural node shape - circular with pulsing effect
        float nodeShape = 1.0 - smoothstep(0.0, 0.5, dist);
        
        // Pulsing glow effect
        float pulse = sin(vPulse * 3.14159) * 0.3 + 0.7;
        float glow = nodeShape * pulse;

        // Bright center with outer glow
        float innerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
        float outerGlow = 1.0 - smoothstep(0.2, 0.6, dist);

        // Neural network colors - bright green/cyan
        vec3 nodeColor = vColor * (1.0 + innerGlow * 0.5);
        nodeColor += vec3(0.2, 0.4, 0.3) * outerGlow * pulse;

        float alpha = glow * 0.9;

        gl_FragColor = vec4(nodeColor, alpha);
      }
    `;

    // Create materials
    const nodeMaterial = new THREE.ShaderMaterial({
      vertexShader: nodeVertexShader,
      fragmentShader: nodeFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x66ff88,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    // Create neural network objects
    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    const connectionLines = new THREE.LineSegments(connectionGeometry, connectionMaterial);
    
    scene.add(nodePoints);
    scene.add(connectionLines);
    
    // Initialize neural network nodes
    console.log('Initializing neural network...');
    for (let i = 0; i < MAX_NODES; i++) {
      nodes.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * window.innerWidth,
          (Math.random() - 0.5) * window.innerHeight,
          (Math.random() - 0.5) * 200
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        pulse: Math.random(),
        connections: [],
        active: true,
      });
    }

    // Create connections between nearby nodes - limit long lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = nodes[i].position.distanceTo(nodes[j].position);
        
        // Only connect nodes that are close together (shorter lines)
        const maxConnectionDistance = CONNECTION_DISTANCE * 0.6; // 60% of original distance
        
        if (distance < maxConnectionDistance && connections.length < MAX_CONNECTIONS) {
          // Add some randomness to avoid too many connections
          if (Math.random() > 0.3) { // Only 70% chance to connect
            connections.push({
              from: i,
              to: j,
              strength: 1.0 - (distance / maxConnectionDistance),
              dataFlow: Math.random(),
            });
            nodes[i].connections.push(j);
            nodes[j].connections.push(i);
          }
        }
      }
    }

    // Neural network color palette - AI-inspired greens and cyans
    const neuralColors = [
      new THREE.Color(0x00ff88), // Bright neural green
      new THREE.Color(0x66ffaa), // Light green
      new THREE.Color(0x88ffcc), // Cyan-green
      new THREE.Color(0xaaffdd), // Light cyan
    ];

    // Mouse tracking for neural network interaction
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX - window.innerWidth / 2;
      mouse.y = -(event.clientY - window.innerHeight / 2);

      // Activate nearby nodes when mouse moves
      const mousePos = new THREE.Vector3(mouse.x, mouse.y, 0);
      const activationRadius = 100;

      for (let i = 0; i < nodes.length; i++) {
        const distance = nodes[i].position.distanceTo(mousePos);
        if (distance < activationRadius) {
          // Boost pulse and activity of nearby nodes
          nodes[i].pulse = Math.min(nodes[i].pulse + 0.1, 1.0);
          nodes[i].active = true;
          
          // Add slight attraction to mouse
          const attraction = (activationRadius - distance) / activationRadius;
          const direction = mousePos.clone().sub(nodes[i].position).normalize();
          nodes[i].velocity.add(direction.multiplyScalar(attraction * 0.02));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle window resize
    const handleResize = () => {
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
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
      
      // Debug: log every 60 frames (about once per second)
      if (Math.floor(elapsedTime * 60) % 60 === 0) {
        console.log('Neural network running, nodes:', nodes.length, 'connections:', connections.length);
      }

      // Update neural network nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Update pulse animation
        node.pulse += PULSE_SPEED;
        if (node.pulse > 1.0) node.pulse = 0.0;

        // Gentle floating movement
        node.position.add(node.velocity);

        // Add subtle floating motion
        node.position.x += Math.sin(elapsedTime * 0.3 + i * 0.1) * 0.2;
        node.position.y += Math.cos(elapsedTime * 0.4 + i * 0.15) * 0.2;

        // Keep nodes within bounds
        if (node.position.x > window.innerWidth / 2) node.position.x = -window.innerWidth / 2;
        if (node.position.x < -window.innerWidth / 2) node.position.x = window.innerWidth / 2;
        if (node.position.y > window.innerHeight / 2) node.position.y = -window.innerHeight / 2;
        if (node.position.y < -window.innerHeight / 2) node.position.y = window.innerHeight / 2;

        // Gradually slow down velocity
        node.velocity.multiplyScalar(0.98);
      }

      // Update connections data flow
      for (let i = 0; i < connections.length; i++) {
        connections[i].dataFlow += 0.02;
        if (connections[i].dataFlow > 1.0) connections[i].dataFlow = 0.0;
      }

      // Update node geometry
      for (let i = 0; i < MAX_NODES; i++) {
        if (i < nodes.length) {
          const node = nodes[i];
          const index = i * 3;

          // Position
          nodePositions[index] = node.position.x;
          nodePositions[index + 1] = node.position.y;
          nodePositions[index + 2] = node.position.z;

          // Color based on activity and pulse
          const colorIndex = Math.floor(node.pulse * (neuralColors.length - 1));
          const color = neuralColors[Math.min(colorIndex, neuralColors.length - 1)];

          nodeColors[index] = color.r;
          nodeColors[index + 1] = node.pulse; // Encode pulse in green for shader
          nodeColors[index + 2] = color.b;

          // Size based on activity
          const sizeMultiplier = node.active ? 1.2 : 1.0;
          nodeSizes[i] = NODE_SIZE * sizeMultiplier * (0.8 + Math.random() * 0.4);
        } else {
          // Hide unused nodes
          nodePositions[i * 3] = 0;
          nodePositions[i * 3 + 1] = 0;
          nodePositions[i * 3 + 2] = -1000;
          nodeSizes[i] = 0;
        }
      }

      // Update connection geometry
      for (let i = 0; i < MAX_CONNECTIONS; i++) {
        if (i < connections.length) {
          const connection = connections[i];
          const fromNode = nodes[connection.from];
          const toNode = nodes[connection.to];
          const index = i * 6;

          // From position
          connectionPositions[index] = fromNode.position.x;
          connectionPositions[index + 1] = fromNode.position.y;
          connectionPositions[index + 2] = fromNode.position.z;

          // To position
          connectionPositions[index + 3] = toNode.position.x;
          connectionPositions[index + 4] = toNode.position.y;
          connectionPositions[index + 5] = toNode.position.z;

          // Connection colors based on data flow
          const flowIntensity = Math.sin(connection.dataFlow * Math.PI * 2) * 0.3 + 0.7;
          const baseColor = new THREE.Color(0x66ff88);
          
          connectionColors[index] = baseColor.r * flowIntensity;
          connectionColors[index + 1] = baseColor.g * flowIntensity;
          connectionColors[index + 2] = baseColor.b * flowIntensity;
          connectionColors[index + 3] = baseColor.r * flowIntensity;
          connectionColors[index + 4] = baseColor.g * flowIntensity;
          connectionColors[index + 5] = baseColor.b * flowIntensity;

          connectionWidths[i] = CONNECTION_WIDTH * connection.strength * flowIntensity;
        } else {
          // Hide unused connections
          connectionPositions[i * 6] = 0;
          connectionPositions[i * 6 + 1] = 0;
          connectionPositions[i * 6 + 2] = -1000;
          connectionPositions[i * 6 + 3] = 0;
          connectionPositions[i * 6 + 4] = 0;
          connectionPositions[i * 6 + 5] = -1000;
          connectionWidths[i] = 0;
        }
      }

      nodeGeometry.attributes.position.needsUpdate = true;
      nodeGeometry.attributes.color.needsUpdate = true;
      nodeGeometry.attributes.size.needsUpdate = true;
      nodeGeometry.setDrawRange(0, Math.min(nodes.length, MAX_NODES));

      connectionGeometry.attributes.position.needsUpdate = true;
      connectionGeometry.attributes.color.needsUpdate = true;
      connectionGeometry.setDrawRange(0, Math.min(connections.length * 2, MAX_CONNECTIONS * 2));

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      nodeGeometry.dispose();
      nodeMaterial.dispose();
      connectionGeometry.dispose();
      connectionMaterial.dispose();
      renderer.dispose();
    };
    } catch (error) {
      console.error('WebGL Background initialization failed:', error);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
    />
  );
}
