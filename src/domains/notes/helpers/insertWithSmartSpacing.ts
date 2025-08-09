type TInsertResult = {
  text: string;
  endPosition: number;
};

type TInsertWithSmartSpacingParams = {
  original: string;
  insertText: string;
  position: number;
  endPosition: number;
};

/**
 * Returns position of cursor and adds whitespace after inserting text
 * Have a look at the tests to understand how smart spacing works
 */
export function insertWithSmartSpacing({
  original,
  insertText,
  position,
  endPosition,
}: TInsertWithSmartSpacingParams): TInsertResult {
  // Remove the text in the range if we're replacing
  const before = original.substring(0, position);
  const after = original.substring(endPosition);

  // If we're not inserting anything, just return the text with the range removed
  if (!insertText) {
    return { text: before + after, endPosition: position };
  }

  // Check for whitespace on either side of the insertion point
  const hasSpaceBefore = before.endsWith(' ');
  const hasSpaceAfter = after.startsWith(' ');
  const isAtStart = position === 0;
  const isAtEnd = endPosition === original.length;

  // Handle whitespace based on position
  let spaceBefore = '';
  let spaceAfter = '';

  if (isAtStart) {
    // At start: add space only after the transcript
    spaceAfter = !hasSpaceAfter ? ' ' : '';
  } else if (isAtEnd) {
    // At end: add space only before the transcript
    spaceBefore = !hasSpaceBefore ? ' ' : '';
  } else {
    // In the middle: only add spaces if at least one side has whitespace
    const inMiddleOfWord = !hasSpaceBefore && !hasSpaceAfter;

    spaceBefore = inMiddleOfWord ? '' : !hasSpaceBefore ? ' ' : '';
    spaceAfter = inMiddleOfWord ? '' : !hasSpaceAfter ? ' ' : '';
  }

  const newText = `${before}${spaceBefore}${insertText}${spaceAfter}${after}`;
  const newEndPosition =
    position + spaceBefore.length + insertText.length + spaceAfter.length;

  return { text: newText, endPosition: newEndPosition };
}
