import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";

export type CategoryNavItem = {
  id: string;
  name: string;
};

type CategoryMenuProps = {
  items: CategoryNavItem[];
  layout: "bar" | "panel";
  onNavigate?: () => void;
};

function prefersHover(): boolean {
  if (typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function CategoryMenu({ items, layout, onNavigate }: CategoryMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingFocus = useRef(false);
  const menuId = useId();
  const bar = layout === "bar";
  const hoverOpens = bar && prefersHover();

  useEffect(() => {
    if (!open || !pendingFocus.current) {
      return;
    }

    pendingFocus.current = false;
    itemRefs.current[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function focusItem(index: number) {
    const item = itemRefs.current[index];
    item?.focus();
  }

  function openAndFocusFirst() {
    if (open) {
      focusItem(0);
      return;
    }

    pendingFocus.current = true;
    setOpen(true);
  }

  function handleTriggerClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (event.detail === 0 || hoverOpens) {
      return;
    }

    setOpen((current) => !current);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAndFocusFirst();
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    const enabledItems = itemRefs.current.filter((item) => item !== null);
    const currentIndex = enabledItems.findIndex((item) => item === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem((currentIndex + 1) % enabledItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem((currentIndex - 1 + enabledItems.length) % enabledItems.length);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusItem(enabledItems.length - 1);
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
    }
  }

  function selectItem() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <li
      ref={rootRef}
      className={bar ? "relative" : undefined}
      onMouseEnter={hoverOpens ? () => setOpen(true) : undefined}
      onMouseLeave={hoverOpens ? () => setOpen(false) : undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        className={
          bar
            ? `relative inline-flex items-center gap-1 text-sm font-medium ${
                open ? "text-ink" : "text-ink/80 hover:text-ink"
              }`
            : "flex min-h-11 w-full items-center justify-between text-sm font-medium text-ink"
        }
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        Categorias
        <ChevronDown
          aria-hidden="true"
          size={14}
          className={open ? "rotate-180" : undefined}
        />
        {bar && open ? (
          <span className="absolute -bottom-2 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand" />
        ) : null}
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label="Categorias"
          className={
            bar
              ? "absolute top-full left-0 z-40 mt-3 min-w-56 rounded-xl border border-line bg-paper p-2"
              : "mb-1 ml-3 border-l border-line pl-3"
          }
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <li key={item.id} role="none">
              <button
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-ink hover:bg-band"
                onClick={selectItem}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
