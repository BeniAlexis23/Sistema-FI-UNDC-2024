import { describe, expect, it } from 'vitest';
import { shouldAutoLink } from './autolink.js';

describe('shouldAutoLink', () => {
  it('links what is typed with a protocol or with www', () => {
    expect(shouldAutoLink('https://undc.edu.pe')).toBe(true);
    expect(shouldAutoLink('http://fi.undc.edu.pe/noticias?id=1')).toBe(true);
    expect(shouldAutoLink('HTTPS://UNDC.EDU.PE')).toBe(true);
    expect(shouldAutoLink('www.undc.edu.pe')).toBe(true);
  });

  it('still links an email address', () => {
    expect(shouldAutoLink('fi@undc.edu.pe')).toBe(true);
    expect(shouldAutoLink('mailto:fi@undc.edu.pe')).toBe(true);
  });

  it('leaves alone abbreviations that look like a domain', () => {
    // «.sc», «.pe» o «.me» son dominios reales: sin esta regla «M.Sc» se vuelve un enlace a http://M.Sc
    for (const text of ['M.Sc', 'M.Sc.', 'Ph.D', 'Ph.D.', 'a.m.', 'p.m.', 'Mg.Sc', 'undc.edu.pe', 'Sr.Pérez']) {
      expect(shouldAutoLink(text)).toBe(false);
    }
  });
});
