"use client";

import { Modal } from "@/components/ui/Modal";
import { AuthForm, type AuthMode } from "./AuthForm";

export function AuthModal({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={mode === "signin" ? "Log in" : "Sign up"}>
      <AuthForm mode={mode} onDone={onClose} />
    </Modal>
  );
}
