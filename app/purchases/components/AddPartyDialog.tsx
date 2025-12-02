/**
 * AddPartyDialog Component
 * Dialog for adding new party/supplier
 * Follows Single Responsibility Principle
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VoucherParty } from './types';

interface AddPartyDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (party: Omit<VoucherParty, 'id'>) => void;
}

export function AddPartyDialog({ open, onClose, onAdd }: AddPartyDialogProps) {
  const [newParty, setNewParty] = useState({
    name: "",
    contact: "",
    gst: "",
    state: "",
  });

  const handleAdd = () => {
    if (newParty.name.trim()) {
      onAdd(newParty);
      setNewParty({ name: "", contact: "", gst: "", state: "" });
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter" && newParty.name.trim()) {
      e.preventDefault();
      if (field === "state") {
        handleAdd();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Party</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Party Name *</Label>
            <Input
              value={newParty.name}
              onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "name")}
              placeholder="Enter party name..."
              className="mt-1"
              autoFocus
            />
          </div>
          <div>
            <Label>Contact Number</Label>
            <Input
              value={newParty.contact}
              onChange={(e) => setNewParty({ ...newParty, contact: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "contact")}
              placeholder="Enter phone number..."
              className="mt-1"
            />
          </div>
          <div>
            <Label>GST Number</Label>
            <Input
              value={newParty.gst}
              onChange={(e) => setNewParty({ ...newParty, gst: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "gst")}
              placeholder="Enter GST number..."
              className="mt-1"
            />
          </div>
          <div>
            <Label>State *</Label>
            <Input
              value={newParty.state}
              onChange={(e) => setNewParty({ ...newParty, state: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "state")}
              placeholder="Enter state name..."
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setNewParty({ name: "", contact: "", gst: "", state: "" });
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!newParty.name.trim()}>
            Add Party
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

