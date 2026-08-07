import { describe, expect, it } from 'vitest';

import { isKnownVsVersion, vsversion_to_versionnumber, vsversion_to_year } from '../src/version.js';

describe('vsversion_to_versionnumber', () => {
  it('maps Visual Studio years to version numbers', () => {
    expect(vsversion_to_versionnumber('2019')).toBe('16.0');
    expect(vsversion_to_versionnumber('2022')).toBe('17.0');
    expect(vsversion_to_versionnumber('2026')).toBe('18.0');
  });

  it('passes through version numbers unchanged', () => {
    expect(vsversion_to_versionnumber('16.0')).toBe('16.0');
    expect(vsversion_to_versionnumber('17.0')).toBe('17.0');
    expect(vsversion_to_versionnumber('18.0')).toBe('18.0');
  });

  it('returns unknown values unchanged', () => {
    expect(vsversion_to_versionnumber('custom')).toBe('custom');
  });
});

describe('vsversion_to_year', () => {
  it('maps version numbers to Visual Studio years', () => {
    expect(vsversion_to_year('16.0')).toBe('2019');
    expect(vsversion_to_year('17.0')).toBe('2022');
    expect(vsversion_to_year('18.0')).toBe('2026');
  });

  it('passes through years unchanged', () => {
    expect(vsversion_to_year('2019')).toBe('2019');
    expect(vsversion_to_year('2022')).toBe('2022');
    expect(vsversion_to_year('2026')).toBe('2026');
  });

  it('returns unknown values unchanged', () => {
    expect(vsversion_to_year('custom')).toBe('custom');
  });
});

describe('isKnownVsVersion', () => {
  it('recognizes years and version numbers', () => {
    expect(isKnownVsVersion('2026')).toBe(true);
    expect(isKnownVsVersion('18.0')).toBe(true);
    expect(isKnownVsVersion('custom')).toBe(false);
    expect(isKnownVsVersion('')).toBe(false);
  });
});
