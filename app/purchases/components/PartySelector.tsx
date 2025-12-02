/**
 * PartySelector Component
 * Handles party/supplier selection with autocomplete
 * Follows Single Responsibility Principle
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VoucherParty } from './types';

interface PartySelectorProps {
  selectedParty: string;
  parties: VoucherParty[];
  companyState: string;
  onPartySelect: (partyName: string, partyState: string) => void;
  onAddPartyClick: () => void;
}

export function PartySelector({
  selectedParty,
  parties,
  companyState,
  onPartySelect,
  onAddPartyClick,
}: PartySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredParties, setFilteredParties] = useState<VoucherParty[]>(parties);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredParties(parties);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = parties.filter(
        (party) =>
          party.name.toLowerCase().includes(query) ||
          party.contact?.toLowerCase().includes(query) ||
          party.gst?.toLowerCase().includes(query)
      );
      setFilteredParties(filtered);
    }
  }, [searchQuery, parties]);

  const handlePartySelect = (party: VoucherParty) => {
    setSearchQuery(party.name);
    onPartySelect(party.name, party.state);
    setShowDropdown(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label>Party Ledger / Supplier Name *</Label>
              <div className="relative mt-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Search or type party name..."
                />
                
                {showDropdown && filteredParties.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto z-50">
                    {filteredParties.map((party) => (
                      <div
                        key={party.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => handlePartySelect(party)}
                      >
                        <div className="font-medium">{party.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {party.contact} | {party.gst} | {party.state}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={onAddPartyClick}
              title="Add New Party"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {selectedParty && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <div className="font-medium">{selectedParty}</div>
              <div className="text-muted-foreground">
                {parties.find((p) => p.name === selectedParty)?.state || companyState}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

