import type { Directive, DirectiveBinding } from "vue";
import { useAuthStore } from "@/stores/auth";

type PermissionValue = string | string[] | null | undefined;

interface ElementState {
  display: string;
  disabled: boolean;
}

const states = new WeakMap<HTMLElement, ElementState>();

function isGranted(value: PermissionValue): boolean {
  const keys = (Array.isArray(value) ? value : [value]).filter(
    (key): key is string => typeof key === "string" && key.length > 0
  );
  if (!keys.length) return true;
  const auth = useAuthStore();
  return keys.some((key) => auth.hasPermission(key));
}

function ensureState(el: HTMLElement): ElementState {
  let state = states.get(el);
  if (!state) {
    state = {
      display: el.style.display,
      disabled: el.hasAttribute("disabled")
    };
    states.set(el, state);
  }
  return state;
}

function apply(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
  const granted = isGranted(binding.value);
  const state = ensureState(el);

  // v-permission:disable：无权限时置灰而非隐藏
  if (binding.arg === "disable") {
    if (granted) {
      if (!state.disabled) {
        el.removeAttribute("disabled");
        (el as HTMLButtonElement).disabled = false;
      }
      el.classList.remove("is-disabled", "permission-disabled");
    } else {
      el.setAttribute("disabled", "disabled");
      (el as HTMLButtonElement).disabled = true;
      el.classList.add("is-disabled", "permission-disabled");
    }
    return;
  }

  // v-permission：无权限时隐藏
  el.style.display = granted ? state.display : "none";
}

const vPermission: Directive<HTMLElement, PermissionValue> = {
  mounted: apply,
  updated: apply
};

declare module "vue" {
  interface GlobalDirectives {
    vPermission: typeof vPermission;
  }
}

export default vPermission;
