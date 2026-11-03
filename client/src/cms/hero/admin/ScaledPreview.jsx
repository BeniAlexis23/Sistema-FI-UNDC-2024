import { useLayoutEffect, useRef, useState } from 'react';

/* Muestra `children` con el tamaño real (width × height) reducido para caber en el ancho disponible,
   así la vista previa conserva la tipografía y los recortes del carrusel de verdad */
const ScaledPreview = ({ width, height, maxWidth, children }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const update = () => setScale(container.clientWidth / width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full overflow-hidden rounded-2xl bg-slate-900" style={{ height: height * scale, maxWidth }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
};

export default ScaledPreview;
