import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SessionWarningProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  countdown: number;
}

export function SessionWarning({ isOpen, onExtendSession, onLogout, countdown }: SessionWarningProps) {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <Modal 
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside
      hideCloseButton
      isDismissable={false}
      className="max-w-md"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Icon icon="lucide:clock" className="text-warning text-xl" />
          Session Timeout Warning
        </ModalHeader>
        <ModalBody>
          <p className="text-foreground-700">
            For your security, your session will expire in{" "}
            <span className="font-semibold text-warning">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </p>
          <p className="text-foreground-600 text-sm">
            To protect your health information, we automatically log out inactive users.
            Click "Stay Logged In" to extend your session.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onLogout}
            startContent={<Icon icon="lucide:log-out" />}
          >
            Log Out Now
          </Button>
          <Button
            color="primary"
            onPress={onExtendSession}
            startContent={<Icon icon="lucide:refresh-cw" />}
          >
            Stay Logged In
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}