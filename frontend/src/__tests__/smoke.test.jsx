// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('App smoke test - verifies all routes and components render without ReferenceError', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    // Mock matchMedia
    window.matchMedia = window.matchMedia || function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {},
      };
    };
    // Mock scrollTo
    window.scrollTo = function () {};
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  const routesToTest = [
    '/',
    '/catalogo',
    '/ofertas',
    '/campanas/black-friday',
    '/carrito',
    '/checkout',
    '/login',
    '/admin',
    '/admin/productos',
    '/admin/categorias',
    '/admin/pedidos',
    '/admin/campanas',
    '/admin/cupones',
    '/admin/colecciones',
    '/admin/portada',
    '/admin/marketing',
    '/admin/usuarios',
    '/admin/configuracion'
  ];

  routesToTest.forEach((route) => {
    it(`renders route "${route}" without ReferenceError or throwing`, async () => {
      window.history.pushState({}, 'Test Route', route);
      await act(async () => {
        root.render(<App />);
      });
      expect(container.innerHTML).not.toBe('');
    });
  });
});
