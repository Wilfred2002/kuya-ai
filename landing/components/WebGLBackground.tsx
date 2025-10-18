'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA: {
      WAVES: (options: VantaWavesOptions) => VantaEffect;
    };
  }
}

interface VantaEffect {
  destroy: () => void;
  resize: () => void;
}

interface VantaWavesOptions {
  el: HTMLElement;
  THREE?: unknown;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  color?: number;
  shininess?: number;
  waveHeight?: number;
  waveSpeed?: number;
  zoom?: number;
}

export default function WebGLBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    // Dynamically import THREE and VANTA
    const loadVanta = async () => {
      const THREE = await import('three');
      const VANTA = await import('vanta/dist/vanta.waves.min.js');

      if (vantaRef.current && !vantaEffect.current) {
        vantaEffect.current = (VANTA as unknown as { default: typeof window.VANTA }).default.WAVES({
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
    };

    loadVanta();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 -z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
