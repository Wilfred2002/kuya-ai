'use client';

import { useEffect, useRef, useState } from 'react';

interface VantaEffect {
  destroy: () => void;
  resize: () => void;
}

export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !vantaRef.current || vantaEffect.current) return;

    // Dynamically import THREE and VANTA only on client side
    const loadVanta = async () => {
      try {
        const THREE = await import('three');
        const VANTA = await import('vanta/dist/vanta.waves.min.js');

        if (vantaRef.current && !vantaEffect.current) {
          // @ts-ignore - Vanta types are not perfect
          vantaEffect.current = VANTA.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x5a9e4d, // Matcha green
            shininess: 30.0,
            waveHeight: 15.0,
            waveSpeed: 0.75,
            zoom: 0.85,
          });
        }
      } catch (error) {
        console.error('Failed to load Vanta.js:', error);
      }
    };

    loadVanta();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 -z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
