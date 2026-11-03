const POSITIONS = [0, 50, 100];

// Nombre de cada zona, por fila (arriba, centro, abajo) y columna (izquierda, centro, derecha)
const NAMES = [
  ['arriba a la izquierda', 'arriba', 'arriba a la derecha'],
  ['a la izquierda', 'el centro', 'a la derecha'],
  ['abajo a la izquierda', 'abajo', 'abajo a la derecha'],
];

/* Elige qué zona de la imagen se conserva cuando el carrusel la recorta (3 × 3) */
const FocusPicker = ({ x, y, onChange }) => (
  <div role="group" aria-label="Zona de la imagen que se conserva" className="inline-grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
    {POSITIONS.map((positionY, row) => POSITIONS.map((positionX, column) => {
      const active = x === positionX && y === positionY;
      return (
        <button
          key={`${positionX}-${positionY}`}
          type="button"
          aria-pressed={active}
          aria-label={`Conservar ${NAMES[row][column]}`}
          onClick={() => onChange({ focusX: positionX, focusY: positionY })}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 ${active ? 'border-primary bg-primary' : 'border-slate-200 bg-white hover:border-sky-300'}`}
        >
          <span className={`block h-2 w-2 rounded-full ${active ? 'bg-white' : 'bg-slate-300'}`} />
        </button>
      );
    }))}
  </div>
);

export default FocusPicker;
