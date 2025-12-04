import React, { useState } from "react";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { apiCall } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface SupportBubbleProps {
  onTicketCreated?: () => void;
}

export const SupportBubble: React.FC<SupportBubbleProps> = ({ onTicketCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleShowConfirmation = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleCreateTicket = async () => {
    const token = localStorage.getItem('auth-token');
    
    if (!token || !title.trim() || !description.trim()) {
      return;
    }
    
    setCreating(true);
    setShowConfirmModal(false);

    try {
      const response = await apiCall("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (response.success) {
        setTitle("");
        setDescription("");
        setIsOpen(false);
        
        // Call callback to refresh tickets count
        if (onTicketCreated) {
          await onTicketCreated();
        }
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Backdrop when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-overlay/30 z-40"
            onClick={() => {
              if (!creating) {
                setIsOpen(false);
                setTitle("");
                setDescription("");
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Bubble or Expanded Form */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              isIconOnly
              color="primary"
              size="lg"
              className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              onPress={() => setIsOpen(true)}
              aria-label="Support"
            >
              <Icon icon="lucide:message-circle" className="text-2xl" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 bg-content1 rounded-2xl shadow-2xl border border-content3 w-96 max-h-[600px] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-content3 bg-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                    <Icon icon="lucide:headphones" className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Need Help?</h3>
                    <p className="text-xs opacity-90">We're here for you</p>
                  </div>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-primary-foreground"
                  onPress={() => {
                    if (!creating) {
                      setIsOpen(false);
                      setTitle("");
                      setDescription("");
                    }
                  }}
                  isDisabled={creating}
                >
                  <Icon icon="lucide:x" />
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  placeholder="What do you need help with?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="lg"
                  isDisabled={creating}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  disabled={creating}
                  className="w-full px-4 py-3 rounded-xl bg-content2 border border-content3 resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <Button
                color="primary"
                size="lg"
                className="w-full"
                isDisabled={!title.trim() || !description.trim()}
                onPress={handleShowConfirmation}
              >
                Send Message
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => !creating && setShowConfirmModal(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-content1 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="lucide:alert-triangle" className="text-warning-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Confirm Support Request</h3>
                      <p className="text-sm text-foreground-500">Please read before continuing</p>
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => !creating && setShowConfirmModal(false)}
                    isDisabled={creating}
                  >
                    <Icon icon="lucide:x" />
                  </Button>
                </div>

                {/* Warning Content */}
                <div className="bg-warning-50 border-l-4 border-warning-400 rounded-lg p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-warning-800">
                      Platform Support Only
                    </p>
                    <p className="text-sm text-warning-700 leading-relaxed">
                      This support system is for technical issues, billing questions, or platform-related concerns only.
                    </p>
                    <p className="text-sm text-warning-700 leading-relaxed">
                      <strong>For medical concerns or prescription-related questions</strong>, please use the Messenger to communicate directly with your healthcare provider.
                    </p>
                  </div>
                </div>

                {/* Question */}
                <div className="pt-2">
                  <p className="text-sm font-medium text-foreground text-center">
                    Are you sure you want to create this support ticket?
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    color="default"
                    variant="flat"
                    size="lg"
                    className="flex-1"
                    onPress={() => setShowConfirmModal(false)}
                    isDisabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    size="lg"
                    className="flex-1"
                    isLoading={creating}
                    onPress={handleCreateTicket}
                  >
                    Yes, Create Ticket
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

