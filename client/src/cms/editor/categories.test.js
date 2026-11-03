import { describe, expect, it } from 'vitest';
import { categoryNameError, categorySlug, cleanCategoryName, findCategoryByName, withCategory } from './categories';

const category = (name, order, id = name) => ({ _id: id, name, slug: categorySlug(name), order, count: 0 });

describe('cleanCategoryName', () => {
  it('quita los espacios sobrantes', () => {
    expect(cleanCategoryName('  Avisos   y  comunicados ')).toBe('Avisos y comunicados');
  });
});

describe('categorySlug', () => {
  it('sigue la regla del servidor: sin acentos, mayúsculas ni signos', () => {
    expect(categorySlug('Investigación')).toBe('investigacion');
    expect(categorySlug('  Avisos & Comunicados! ')).toBe('avisos-comunicados');
    expect(categorySlug('!!')).toBe('');
  });
});

describe('categoryNameError', () => {
  it('acepta nombres de 2 a 40 caracteres con letras o números', () => {
    expect(categoryNameError('Eventos')).toBe('');
    expect(categoryNameError('  VIII CIISIC  ')).toBe('');
    expect(categoryNameError('Ab')).toBe('');
    expect(categoryNameError('a'.repeat(40))).toBe('');
  });

  it('rechaza nombres cortos, largos o sin letras ni números', () => {
    expect(categoryNameError('')).toMatch(/al menos 2/);
    expect(categoryNameError('  A  ')).toMatch(/al menos 2/);
    expect(categoryNameError('a'.repeat(41))).toMatch(/hasta 40/);
    expect(categoryNameError('!!')).toMatch(/letras o números/);
  });
});

describe('findCategoryByName', () => {
  const list = [category('Investigación', 0), category('Eventos', 1)];

  it('encuentra la categoría sin distinguir mayúsculas, acentos ni signos', () => {
    expect(findCategoryByName(list, 'investigacion')).toBe(list[0]);
    expect(findCategoryByName(list, ' EVENTOS ')).toBe(list[1]);
    expect(findCategoryByName(list, 'Eventos!')).toBe(list[1]);
  });

  it('devuelve undefined si no existe o el nombre no tiene letras', () => {
    expect(findCategoryByName(list, 'Avisos')).toBeUndefined();
    expect(findCategoryByName(list, '!!')).toBeUndefined();
    expect(findCategoryByName([], 'Eventos')).toBeUndefined();
  });
});

describe('withCategory', () => {
  it('agrega la categoría nueva según su posición sin tocar la lista original', () => {
    const list = [category('Investigación', 0), category('Eventos', 1)];
    const next = withCategory(list, category('Avisos', 2));
    expect(next.map((item) => item.name)).toEqual(['Investigación', 'Eventos', 'Avisos']);
    expect(list).toHaveLength(2);
  });

  it('desempata por nombre y reemplaza una categoría que ya estaba', () => {
    const list = [category('Eventos', 1), category('Avisos', 1)];
    expect(withCategory(list, category('Cultura', 1)).map((item) => item.name)).toEqual(['Avisos', 'Cultura', 'Eventos']);

    const renamed = { ...list[0], name: 'Eventos y actos' };
    const next = withCategory(list, renamed);
    expect(next).toHaveLength(2);
    expect(next.map((item) => item.name)).toEqual(['Avisos', 'Eventos y actos']);
  });
});
