import { describe, expect, it } from 'vitest';
import { insertWithSmartSpacing } from '../insertWithSmartSpacing';

describe('insertWithSmartSpacing', () => {
  it('should insert text at the beginning', () => {
    const result = insertWithSmartSpacing({
      original: 'world',
      insertText: 'hello',
      position: 0,
      endPosition: 0,
    });

    expect(result).toEqual({
      text: 'hello world',
      endPosition: 6,
    });
  });

  it('should insert text at the end', () => {
    const result = insertWithSmartSpacing({
      original: 'hello',
      insertText: 'world',
      position: 5,
      endPosition: 5,
    });

    expect(result).toEqual({
      text: 'hello world',
      endPosition: 11,
    });
  });

  it('should insert text in the middle without adding spaces when not needed', () => {
    const result = insertWithSmartSpacing({
      original: 'helloworld',
      insertText: 'beautiful',
      position: 5,
      endPosition: 5,
    });

    expect(result).toEqual({
      text: 'hellobeautifulworld',
      endPosition: 14,
    });
  });

  it('should add space before when inserting after a word', () => {
    const result = insertWithSmartSpacing({
      original: 'hello',
      insertText: 'world',
      position: 5,
      endPosition: 5,
    });

    expect(result).toEqual({
      text: 'hello world',
      endPosition: 11,
    });
  });

  it('should add space after when inserting before a word', () => {
    const result = insertWithSmartSpacing({
      original: 'world',
      insertText: 'hello',
      position: 0,
      endPosition: 0,
    });

    expect(result).toEqual({
      text: 'hello world',
      endPosition: 6,
    });
  });

  it('should replace selected text', () => {
    const result = insertWithSmartSpacing({
      original: 'hello beautiful world',
      insertText: 'wonderful',
      position: 6,
      endPosition: 15,
    });

    expect(result).toEqual({
      text: 'hello wonderful world',
      endPosition: 15,
    });
  });

  it('should handle empty string insertion', () => {
    const result = insertWithSmartSpacing({
      original: 'hello world',
      insertText: '',
      position: 5,
      endPosition: 5,
    });

    expect(result).toEqual({
      text: 'hello world',
      endPosition: 5,
    });
  });

  it('should handle empty string replacement', () => {
    const result = insertWithSmartSpacing({
      original: 'hello world',
      insertText: '',
      position: 5,
      endPosition: 11,
    });

    expect(result).toEqual({
      text: 'hello',
      endPosition: 5,
    });
  });

  it('should handle insertion at the end with existing space', () => {
    const result = insertWithSmartSpacing({
      original: 'hello ',
      insertText: 'world',
      position: 6,
      endPosition: 6,
    });

    expect(result).toEqual({
      text: 'hello world',
      endPosition: 11,
    });
  });

  it('should handle insertion at the beginning with existing space', () => {
    const result = insertWithSmartSpacing({
      original: ' world',
      insertText: 'hello',
      position: 0,
      endPosition: 0,
    });

    expect(result).toEqual({
      text: 'hello world',
      endPosition: 5,
    });
  });

  it('should handle insertion between words without adding spaces', () => {
    const result = insertWithSmartSpacing({
      original: 'hello  world',
      insertText: 'beautiful',
      position: 5,
      endPosition: 5,
    });

    expect(result).toEqual({
      text: 'hello beautiful  world',
      endPosition: 15,
    });
  });
});
