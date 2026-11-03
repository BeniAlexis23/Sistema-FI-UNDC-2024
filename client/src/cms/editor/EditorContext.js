import { createContext, useContext } from 'react';

/* Permite que los editores de cada bloque avisen de las subidas en curso (para no guardar a medias) */
export const EditorContext = createContext({ trackUpload: (promise) => promise });

export const useEditorContext = () => useContext(EditorContext);
