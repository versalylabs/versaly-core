"use client";

import { useState, useEffect, useMemo } from "react";
import { PersonItem, INITIAL_PEOPLE, RelationshipType, PersonRelationship } from "@/data/people-seed";
import { appStorage } from "@/lib/app-storage";
import { STORAGE_KEY } from "./helpers";

export function usePeople() {

  const [people, setPeople] = useState<PersonItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PEOPLE;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmPerson, setDeleteConfirmPerson] = useState<PersonItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("+254 ");
  const [formWhatsApp, setFormWhatsApp] = useState("+254 ");
  const [formOrgName, setFormOrgName] = useState("");
  const [formRelationship, setFormRelationship] = useState<RelationshipType>("Decision Maker");
  const [formRelationshipContext, setFormRelationshipContext] = useState("");
  const [formProductInterests, setFormProductInterests] = useState<string[]>(["Vehisoft"]);
  const [formTags, setFormTags] = useState<string[]>(["Direct Contact"]);
  const [tagInput, setTagInput] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Additional relationships
  const [additionalRelationships, setAdditionalRelationships] = useState<PersonRelationship[]>([]);
  const [newRelOrg, setNewRelOrg] = useState("");
  const [newRelType, setNewRelType] = useState<RelationshipType>("Partner");
  const [newRelContext, setNewRelContext] = useState("");
  const [showAddRelForm, setShowAddRelForm] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      appStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    } catch {
      // ignore
    }
  }, [people]);


  const selectedPerson = useMemo(() => {
    return people.find((p) => p.id === selectedPersonId) || people[0] || null;
  }, [people, selectedPersonId]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [people]);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.primaryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.primaryOrganizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery);

      const matchesTag = selectedTag === "ALL" || p.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [people, searchQuery, selectedTag]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode("ADD");
    setEditingPersonId(null);
    setFormName("");
    setFormTitle("");
    setFormEmail("");
    setFormPhone("+254 ");
    setFormWhatsApp("+254 ");
    setFormOrgName("");
    setFormRelationship("Decision Maker");
    setFormRelationshipContext("Primary decision maker for operational software.");
    setFormProductInterests(["Vehisoft"]);
    setFormTags(["Direct Contact"]);
    setTagInput("");
    setFormNotes("");
    setAdditionalRelationships([]);
    setShowAddRelForm(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (person: PersonItem) => {
    setModalMode("EDIT");
    setEditingPersonId(person.id);
    setFormName(person.fullName);
    setFormTitle(person.primaryTitle);
    setFormEmail(person.email);
    setFormPhone(person.phone);
    setFormWhatsApp(person.whatsApp || person.phone);
    setFormOrgName(person.primaryOrganizationName);

    // Primary relationship
    const primaryRel = person.relationships[0];
    if (primaryRel) {
      setFormRelationship(primaryRel.relationshipType);
      setFormRelationshipContext(primaryRel.context);
    } else {
      setFormRelationship("Decision Maker");
      setFormRelationshipContext("");
    }

    // Additional relationships
    setAdditionalRelationships(person.relationships.slice(1));
    setShowAddRelForm(false);

    setFormProductInterests([...person.productInterests]);
    setFormTags([...person.tags]);
    setTagInput("");
    setFormNotes(person.notes);
    setIsModalOpen(true);
  };

  // Toggle product interest
  const toggleProductInterest = (prod: string) => {
    setFormProductInterests((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );
  };

  // Add tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const tag = tagInput.trim();
    if (!formTags.includes(tag)) {
      setFormTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setFormTags((prev) => prev.filter((t) => t !== tag));
  };

  // Add extra relationship
  const handleAddRelationship = () => {
    if (!newRelOrg.trim()) return;
    const newRel: PersonRelationship = {
      organizationId: `org-${Date.now()}`,
      organizationName: newRelOrg.trim(),
      relationshipType: newRelType,
      context: newRelContext.trim() || `${newRelType} role with ${newRelOrg.trim()}`,
    };
    setAdditionalRelationships((prev) => [...prev, newRel]);
    setNewRelOrg("");
    setNewRelContext("");
    setShowAddRelForm(false);
  };

  // Remove relationship
  const handleRemoveRelationship = (index: number) => {
    setAdditionalRelationships((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Person (Add or Edit)
  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formOrgName.trim()) return;

    const primaryRel: PersonRelationship = {
      organizationId: `org-${Date.now()}-prim`,
      organizationName: formOrgName.trim(),
      relationshipType: formRelationship,
      context:
        formRelationshipContext.trim() ||
        `Primary ${formRelationship} for ${formProductInterests.join(", ")} solution.`,
    };

    const allPersonRelationships = [primaryRel, ...additionalRelationships];

    if (modalMode === "ADD") {
      const newPerson: PersonItem = {
        id: `per-${Date.now()}`,
        fullName: formName.trim(),
        primaryTitle: formTitle.trim() || "Stakeholder",
        email: formEmail.trim() || "contact@client.co.ke",
        phone: formPhone.trim(),
        whatsApp: formWhatsApp.trim() || formPhone.trim(),
        primaryOrganizationId: primaryRel.organizationId,
        primaryOrganizationName: formOrgName.trim(),
        productInterests: formProductInterests.length > 0 ? formProductInterests : ["Multi-product"],
        relationships: allPersonRelationships,
        tags: formTags.length > 0 ? formTags : ["Direct Contact"],
        lastContacted: "Just added",
        notes: formNotes.trim() || "Recorded in people & network registry.",
      };

      setPeople((prev) => [newPerson, ...prev]);
      setSelectedPersonId(newPerson.id);
      setIsModalOpen(false);
      setToastMessage(`✓ Added "${newPerson.fullName}" to network registry!`);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      if (!editingPersonId) return;

      const updatedPerson: PersonItem = {
        id: editingPersonId,
        fullName: formName.trim(),
        primaryTitle: formTitle.trim() || "Stakeholder",
        email: formEmail.trim() || "contact@client.co.ke",
        phone: formPhone.trim(),
        whatsApp: formWhatsApp.trim() || formPhone.trim(),
        primaryOrganizationId: primaryRel.organizationId,
        primaryOrganizationName: formOrgName.trim(),
        productInterests: formProductInterests.length > 0 ? formProductInterests : ["Multi-product"],
        relationships: allPersonRelationships,
        tags: formTags.length > 0 ? formTags : ["Direct Contact"],
        lastContacted: "Updated today",
        notes: formNotes.trim() || "Recorded in people & network registry.",
      };

      setPeople((prev) => prev.map((p) => (p.id === editingPersonId ? updatedPerson : p)));
      setIsModalOpen(false);
      setToastMessage(`✓ Updated stakeholder details for "${updatedPerson.fullName}"!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Delete Person
  const handleDeletePerson = (personId: string) => {
    const toDelete = people.find((p) => p.id === personId);
    const updated = people.filter((p) => p.id !== personId);
    setPeople(updated);
    if (selectedPersonId === personId) {
      setSelectedPersonId(updated[0]?.id || "");
    }
    setDeleteConfirmPerson(null);
    setToastMessage(`✓ Removed "${toDelete?.fullName || "Stakeholder"}" from registry.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Clear all to clean slate
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all stakeholders and start afresh?")) {
      setPeople([]);
      setSelectedPersonId("");
      appStorage.removeItem(STORAGE_KEY);
      setToastMessage("✓ People directory cleared. Ready for your live network.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return {
    people,
    setPeople,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    selectedPersonId,
    setSelectedPersonId,
    toastMessage,
    setToastMessage,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    setModalMode,
    editingPersonId,
    setEditingPersonId,
    deleteConfirmPerson,
    setDeleteConfirmPerson,
    formName,
    setFormName,
    formTitle,
    setFormTitle,
    formEmail,
    setFormEmail,
    formPhone,
    setFormPhone,
    formWhatsApp,
    setFormWhatsApp,
    formOrgName,
    setFormOrgName,
    formRelationship,
    setFormRelationship,
    formRelationshipContext,
    setFormRelationshipContext,
    formProductInterests,
    setFormProductInterests,
    formTags,
    setFormTags,
    tagInput,
    setTagInput,
    formNotes,
    setFormNotes,
    additionalRelationships,
    setAdditionalRelationships,
    newRelOrg,
    setNewRelOrg,
    newRelType,
    setNewRelType,
    newRelContext,
    setNewRelContext,
    showAddRelForm,
    setShowAddRelForm,
    selectedPerson,
    allTags,
    filteredPeople,
    openAddModal,
    openEditModal,
    toggleProductInterest,
    handleAddTag,
    handleRemoveTag,
    handleAddRelationship,
    handleRemoveRelationship,
    handleSavePerson,
    handleDeletePerson,
    handleClearAll,
  };
}

export type PeopleModel = ReturnType<typeof usePeople>;
