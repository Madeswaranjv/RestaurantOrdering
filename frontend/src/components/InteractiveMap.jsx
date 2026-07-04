import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export default function InteractiveMap({ 
  pins = [], 
  routeStart = null, // { x, y }
  routeEnd = null,   // { x, y }
  liveTracking = false,
  heatmapPoints = [],
  height = "350px"
}) {
  const [driverPos, setDriverPos] = useState(routeStart || { x: 30, y: 40 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!liveTracking || !routeStart || !routeEnd) return;

    // Reset position when routeStart changes
    setDriverPos(routeStart);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          // Wrap around or stop
          return 0; 
        }
        
        // Linear interpolation for coordinate animation
        const newX = routeStart.x + (routeEnd.x - routeStart.x) * next;
        const newY = routeStart.y + (routeEnd.y - routeStart.y) * next;
        setDriverPos({ x: newX, y: newY });
        
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [liveTracking, routeStart, routeEnd]);

  // Generate SVG path for route
  const getDashedPath = () => {
    if (!routeStart || !routeEnd) return '';
    // Create a curvy path using a cubic bezier control point
    const controlX = (routeStart.x + routeEnd.x) / 2 + 10;
    const controlY = (routeStart.y + routeEnd.y) / 2 - 20;
    return `M ${routeStart.x} ${routeStart.y} Q ${controlX} ${controlY} ${routeEnd.x} ${routeEnd.y}`;
  };

  return (
    <div style={{
      position: 'relative',
      height: height,
      width: '100%',
      background: '#0D0D0D',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8)'
    }}>
      {/* HUD Info */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(10, 10, 10, 0.85)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '10px 14px',
        zIndex: 5,
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Compass className="spin-slow" size={16} style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          {liveTracking ? "TRACKING ACTIVE GPS" : "SATELLITE SECTOR 4G"}
        </span>
      </div>

      {/* SVG Map Canvas */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* Futuristic Map Grids */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Abstract Street Networks */}
        <path d="M0,20 L100,20 M0,50 L100,50 M0,80 L100,80 M20,0 L20,100 M50,0 L50,100 M80,0 L80,100" 
              fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1.5" />
        <path d="M10,10 Q30,40 60,10 T90,40 M10,90 Q40,60 70,90" 
              fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" />

        {/* Heatmap intensity nodes */}
        {heatmapPoints.map((point, index) => (
          <g key={index}>
            <circle 
              cx={point.x} 
              cy={point.y} 
              r={point.intensity * 12} 
              fill="var(--accent-secondary)" 
              opacity={point.intensity * 0.15} 
            />
            <circle 
              cx={point.x} 
              cy={point.y} 
              r={point.intensity * 4} 
              fill="var(--accent-primary)" 
              opacity={point.intensity * 0.3} 
            />
          </g>
        ))}

        {/* Delivery Routes */}
        {routeStart && routeEnd && (
          <>
            {/* Base dashed path */}
            <path 
              d={getDashedPath()} 
              fill="none" 
              stroke="rgba(255,255,255,0.15)" 
              strokeWidth="0.8" 
              strokeDasharray="2,2" 
            />
            {/* Glowing active path */}
            <path 
              d={getDashedPath()} 
              fill="none" 
              stroke="url(#lineGradient)" 
              strokeWidth="1.2" 
              strokeDasharray="3,3"
            />
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
          </>
        )}

        {/* Custom SVG Coordinate Pins */}
        {pins.map((pin, index) => (
          <g key={index} transform={`translate(${pin.x}, ${pin.y})`}>
            {/* Glow Circle */}
            <circle 
              cx="0" 
              cy="0" 
              r="4" 
              fill={pin.type === 'restaurant' ? 'var(--accent-secondary)' : 'var(--accent-primary)'} 
              opacity="0.3"
              className="pulse" 
            />
            {/* Pin Node */}
            <circle 
              cx="0" 
              cy="0" 
              r="1.5" 
              fill={pin.type === 'restaurant' ? 'var(--accent-secondary)' : 'var(--accent-primary)'} 
            />
          </g>
        ))}

        {/* Animated Moving Driver Pin */}
        {liveTracking && routeStart && routeEnd && (
          <g transform={`translate(${driverPos.x}, ${driverPos.y})`}>
            <circle cx="0" cy="0" r="5" fill="rgba(255, 45, 45, 0.4)" />
            <circle cx="0" cy="0" r="2" fill="#FF2D2D" />
          </g>
        )}
      </svg>

      {/* Floating coordinates labels */}
      {pins.map((pin, idx) => (
        <div key={idx} style={{
          position: 'absolute',
          left: `${pin.x}%`,
          top: `${pin.y}%`,
          transform: 'translate(-50%, -130%)',
          background: 'rgba(17, 17, 17, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          color: '#fff',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
          {pin.label}
        </div>
      ))}

      {/* Styles for animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
