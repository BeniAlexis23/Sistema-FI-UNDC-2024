import { AlignLeft, GalleryHorizontal, Image as ImageIcon, Info, Minus, MousePointerClick, Video } from 'lucide-react';

/* Identificador de bloque: 32 caracteres alfanuméricos (el servidor acepta de 6 a 40) */
export const newBlockId = () => (
  globalThis.crypto?.randomUUID?.().replace(/-/g, '')
  ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
);

export const blockTypes = [
  { type: 'text', label: 'Texto', hint: 'Párrafos con formato y emojis', icon: AlignLeft, create: () => ({ id: newBlockId(), type: 'text', html: '' }) },
  { type: 'image', label: 'Imagen', hint: 'Una foto con pie opcional', icon: ImageIcon, create: () => ({ id: newBlockId(), type: 'image', url: '', alt: '', caption: '', width: 'normal' }) },
  { type: 'gallery', label: 'Galería', hint: 'Varias fotos en carrusel o cuadrícula', icon: GalleryHorizontal, create: () => ({ id: newBlockId(), type: 'gallery', layout: 'carousel', images: [] }) },
  { type: 'video', label: 'Video', hint: 'YouTube, Vimeo o Facebook', icon: Video, create: () => ({ id: newBlockId(), type: 'video', url: '', caption: '' }) },
  { type: 'callout', label: 'Aviso destacado', hint: 'Un recuadro para lo importante', icon: Info, create: () => ({ id: newBlockId(), type: 'callout', variant: 'info', html: '' }) },
  { type: 'button', label: 'Botón', hint: 'Un enlace llamativo', icon: MousePointerClick, create: () => ({ id: newBlockId(), type: 'button', label: '', url: '', style: 'primary' }) },
  { type: 'divider', label: 'Separador', hint: 'Una línea entre secciones', icon: Minus, create: () => ({ id: newBlockId(), type: 'divider' }) },
];

export const blockTypeOf = (type) => blockTypes.find((item) => item.type === type);
