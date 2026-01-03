import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TypewriterText } from '../TypewriterText';

jest.useFakeTimers();

type RendererInstance = ReturnType<typeof TestRenderer.create>;

const getDisplayedText = (renderer: RendererInstance): string => {
  const content = renderer.root.findByProps({ testID: 'typewriter-text-content' });
  const children = content.props.children;
  return Array.isArray(children) ? children[0] ?? '' : children ?? '';
};

const pressContainer = (renderer: RendererInstance) => {
  const container = renderer.root.findByProps({ testID: 'typewriter-text-container' });
  container.props.onPress?.();
};

describe('TypewriterText', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('reveals text at the configured speed and calls onComplete once', () => {
    const onComplete = jest.fn();
    let renderer: RendererInstance;

    act(() => {
      renderer = TestRenderer.create(<TypewriterText text="Test" speed={10} onComplete={onComplete} />);
    });

    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(getDisplayedText(renderer)).toBe('T');

    act(() => {
      jest.advanceTimersByTime(30);
    });
    expect(getDisplayedText(renderer)).toBe('Test');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('skips to full text when pressed without double-calling onComplete', () => {
    const onComplete = jest.fn();
    let renderer: RendererInstance;

    act(() => {
      renderer = TestRenderer.create(<TypewriterText text="Hello" speed={20} onComplete={onComplete} />);
    });

    act(() => {
      jest.advanceTimersByTime(20);
      pressContainer(renderer);
    });
    expect(getDisplayedText(renderer)).toBe('Hello');

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('invokes onType for each character', () => {
    const onType = jest.fn();

    act(() => {
      TestRenderer.create(<TypewriterText text="Hi" speed={5} onType={onType} />);
    });

    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(onType).toHaveBeenCalledTimes(2);
    expect(onType).toHaveBeenLastCalledWith(2);
  });

  it('resets and replays when text changes', () => {
    let renderer: RendererInstance;

    act(() => {
      renderer = TestRenderer.create(<TypewriterText text="Old" speed={10} />);
    });

    act(() => {
      jest.advanceTimersByTime(30);
    });
    expect(getDisplayedText(renderer)).toBe('Old');

    act(() => {
      renderer.update(<TypewriterText text="New" speed={10} />);
    });
    expect(getDisplayedText(renderer)).toBe('');

    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(getDisplayedText(renderer)).toBe('N');
  });
});



