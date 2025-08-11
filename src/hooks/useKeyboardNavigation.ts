/**
 * Keyboard Navigation Hook
 * WCAG準拠のキーボードナビゲーション機能を提供
 */

import { useEffect, useCallback, useRef, useState } from 'react';

export interface KeyboardNavigationOptions {
  /** ナビゲーション可能な要素のセレクター */
  itemSelector?: string;
  /** 循環ナビゲーションを有効にするか */
  loop?: boolean;
  /** Escapeキーでフォーカスを初期位置に戻すか */
  escapeToOrigin?: boolean;
  /** 自動フォーカス管理を有効にするか */
  autoFocus?: boolean;
  /** カスタムキーハンドラー */
  onKeyDown?: (event: KeyboardEvent, focusedIndex: number) => boolean;
}

export interface KeyboardNavigationResult {
  /** 現在フォーカスされているアイテムのインデックス */
  focusedIndex: number;
  /** 指定したインデックスにフォーカスを移動 */
  setFocusedIndex: (index: number) => void;
  /** 次のアイテムにフォーカス */
  focusNext: () => void;
  /** 前のアイテムにフォーカス */
  focusPrevious: () => void;
  /** 最初のアイテムにフォーカス */
  focusFirst: () => void;
  /** 最後のアイテムにフォーカス */
  focusLast: () => void;
  /** 現在の要素リストを取得 */
  getItems: () => NodeListOf<HTMLElement>;
  /** コンテナのref */
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * キーボードナビゲーション機能を提供するカスタムHook
 * 
 * @example
 * ```tsx
 * function MenuComponent() {
 *   const { containerRef, focusedIndex } = useKeyboardNavigation({
 *     itemSelector: '[role="menuitem"]',
 *     loop: true,
 *     autoFocus: true
 *   });
 * 
 *   return (
 *     <div ref={containerRef} role="menu">
 *       <button role="menuitem">Item 1</button>
 *       <button role="menuitem">Item 2</button>
 *       <button role="menuitem">Item 3</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useKeyboardNavigation(
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationResult {
  const {
    itemSelector = '[tabindex]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
    loop = false,
    escapeToOrigin = true,
    autoFocus = false,
    onKeyDown
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const originalFocusRef = useRef<HTMLElement | null>(null);

  // 現在のナビゲーション可能要素を取得
  const getItems = useCallback((): NodeListOf<HTMLElement> => {
    if (!containerRef.current) {
      return document.querySelectorAll('') as NodeListOf<HTMLElement>;
    }
    return containerRef.current.querySelectorAll(itemSelector) as NodeListOf<HTMLElement>;
  }, [itemSelector]);

  // 指定したインデックスの要素にフォーカス
  const focusItem = useCallback((index: number) => {
    const items = getItems();
    if (items.length === 0) return;

    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    const item = items[clampedIndex];
    
    if (item) {
      item.focus();
      setFocusedIndex(clampedIndex);
    }
  }, [getItems]);

  // ナビゲーション関数
  const focusNext = useCallback(() => {
    const items = getItems();
    if (items.length === 0) return;

    let nextIndex = focusedIndex + 1;
    if (nextIndex >= items.length) {
      nextIndex = loop ? 0 : items.length - 1;
    }
    focusItem(nextIndex);
  }, [focusedIndex, focusItem, loop, getItems]);

  const focusPrevious = useCallback(() => {
    const items = getItems();
    if (items.length === 0) return;

    let prevIndex = focusedIndex - 1;
    if (prevIndex < 0) {
      prevIndex = loop ? items.length - 1 : 0;
    }
    focusItem(prevIndex);
  }, [focusedIndex, focusItem, loop, getItems]);

  const focusFirst = useCallback(() => {
    focusItem(0);
  }, [focusItem]);

  const focusLast = useCallback(() => {
    const items = getItems();
    if (items.length > 0) {
      focusItem(items.length - 1);
    }
  }, [focusItem, getItems]);

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // カスタムハンドラーが処理した場合は終了
    if (onKeyDown && onKeyDown(event, focusedIndex)) {
      return;
    }

    const { key, shiftKey, ctrlKey, metaKey } = event;

    // 修飾キーが押されている場合は標準動作を維持
    if (ctrlKey || metaKey) {
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        focusNext();
        break;

      case 'ArrowUp':
        event.preventDefault();
        focusPrevious();
        break;

      case 'Home':
        event.preventDefault();
        focusFirst();
        break;

      case 'End':
        event.preventDefault();
        focusLast();
        break;

      case 'Tab':
        // Tabキーの場合は方向に応じてナビゲーション
        if (shiftKey) {
          event.preventDefault();
          focusPrevious();
        } else {
          event.preventDefault();
          focusNext();
        }
        break;

      case 'Enter':
      case ' ':
        // 現在フォーカスされている要素をクリック
        event.preventDefault();
        const items = getItems();
        const currentItem = items[focusedIndex];
        if (currentItem) {
          currentItem.click();
        }
        break;

      case 'Escape':
        if (escapeToOrigin && originalFocusRef.current) {
          event.preventDefault();
          originalFocusRef.current.focus();
        }
        break;

      default:
        // 文字キーによる検索（将来の拡張用）
        break;
    }
  }, [focusedIndex, focusNext, focusPrevious, focusFirst, focusLast, onKeyDown, escapeToOrigin, getItems]);

  // フォーカスイン/アウトの処理
  const handleFocusIn = useCallback((event: FocusEvent) => {
    const items = getItems();
    const focusedElement = event.target as HTMLElement;
    
    // フォーカスされた要素のインデックスを見つける
    const newIndex = Array.from(items).findIndex(item => item === focusedElement);
    if (newIndex !== -1 && newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  }, [focusedIndex, getItems]);

  // イベントリスナーの設定
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 元のフォーカス要素を記録
    if (document.activeElement && document.activeElement !== document.body) {
      originalFocusRef.current = document.activeElement as HTMLElement;
    }

    // イベントリスナーを追加
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocusIn);

    // 自動フォーカスが有効な場合、最初の要素にフォーカス
    if (autoFocus) {
      const items = getItems();
      if (items.length > 0) {
        items[0].focus();
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocusIn);
    };
  }, [handleKeyDown, handleFocusIn, autoFocus, getItems]);

  return {
    focusedIndex,
    setFocusedIndex: focusItem,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    getItems,
    containerRef,
  };
}

/**
 * モーダル・ダイアログ専用のフォーカストラップHook
 * フォーカスをモーダル内に閉じ込める
 */
export function useFocusTrap(isOpen: boolean = false) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    
    // モーダルが開いたときの処理
    if (isOpen) {
      // 現在のフォーカスを保存
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // モーダル内の最初のフォーカス可能要素にフォーカス
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // フォーカストラップのハンドラー
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: 最初の要素の場合は最後に移動
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: 最後の要素の場合は最初に移動
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      container.addEventListener('keydown', handleKeyDown);

      return () => {
        container.removeEventListener('keydown', handleKeyDown);
        
        // モーダルが閉じたときに元の要素にフォーカスを戻す
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  return {
    containerRef,
  };
}

/**
 * ロービングタブインデックス（Roving Tab Index）パターンのHook
 * グリッド状のナビゲーションに対応
 */
export interface RovingTabIndexOptions extends KeyboardNavigationOptions {
  /** 1行あたりのアイテム数（グリッドレイアウト用） */
  itemsPerRow?: number;
  /** 縦方向のナビゲーションを有効にするか */
  enableVerticalNavigation?: boolean;
}

export function useRovingTabIndex(options: RovingTabIndexOptions = {}) {
  const {
    itemsPerRow,
    enableVerticalNavigation = false,
    ...navigationOptions
  } = options;

  const navigation = useKeyboardNavigation({
    ...navigationOptions,
    onKeyDown: (event, focusedIndex) => {
      // グリッドナビゲーションのカスタム処理
      if (itemsPerRow && enableVerticalNavigation) {
        const { key } = event;
        const items = navigation.getItems();
        const totalItems = items.length;

        switch (key) {
          case 'ArrowLeft':
            event.preventDefault();
            const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : (navigationOptions.loop ? totalItems - 1 : 0);
            navigation.setFocusedIndex(prevIndex);
            return true;

          case 'ArrowRight':
            event.preventDefault();
            const nextIndex = focusedIndex < totalItems - 1 ? focusedIndex + 1 : (navigationOptions.loop ? 0 : totalItems - 1);
            navigation.setFocusedIndex(nextIndex);
            return true;

          case 'ArrowUp':
            event.preventDefault();
            const upIndex = focusedIndex - itemsPerRow;
            if (upIndex >= 0) {
              navigation.setFocusedIndex(upIndex);
            } else if (navigationOptions.loop) {
              const rows = Math.ceil(totalItems / itemsPerRow);
              const col = focusedIndex % itemsPerRow;
              const lastRowIndex = (rows - 1) * itemsPerRow + col;
              navigation.setFocusedIndex(Math.min(lastRowIndex, totalItems - 1));
            }
            return true;

          case 'ArrowDown':
            event.preventDefault();
            const downIndex = focusedIndex + itemsPerRow;
            if (downIndex < totalItems) {
              navigation.setFocusedIndex(downIndex);
            } else if (navigationOptions.loop) {
              const col = focusedIndex % itemsPerRow;
              navigation.setFocusedIndex(col);
            }
            return true;
        }
      }

      // デフォルトの処理を続行
      return false;
    }
  });

  // ロービングタブインデックスの実装
  useEffect(() => {
    const items = navigation.getItems();
    
    items.forEach((item, index) => {
      // フォーカスされているアイテムのみtabIndex="0"、その他は"-1"
      item.setAttribute('tabindex', index === navigation.focusedIndex ? '0' : '-1');
    });
  }, [navigation.focusedIndex, navigation.getItems]);

  return navigation;
}