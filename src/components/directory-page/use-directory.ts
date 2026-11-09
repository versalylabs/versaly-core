"use client";

import { useState, useEffect, useMemo } from "react";
import { DirectoryOrganization, DIRECTORY_ORGANIZATIONS, DirectoryPerson, DirectoryActivity } from "@/data/directory-seed";
import { appStorage } from "@/lib/app-storage";
import { STORAGE_KEY } from "./helpers";

export function useDirectory() {

  const [organizations, setOrganizations] = useState<DirectoryOrganization[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return DIRECTORY_ORGANIZATIONS;
  });

  const [activeTab, setActiveTab] = useState<"organizations" | "people">("organizations");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        }
      } catch {
        // ignore
      }
    }
    return DIRECTORY_ORGANIZATIONS[0]?.id || "";
  });
  const [newNoteText, setNewNoteText] = useState("");

  // Modal States
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<DirectoryOrganization | null>(null);
  const [deleteConfirmOrg, setDeleteConfirmOrg] = useState<DirectoryOrganization | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<DirectoryOrganization["type"]>("CLIENT");
  const [formIndustry, setFormIndustry] = useState("");
  const [formProductFit, setFormProductFit] = useState("Vehisoft");
  const [formCity, setFormCity] = useState("Nairobi");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("+254 ");
  const [formEmail, setFormEmail] = useState("");
  const [formTaxPin, setFormTaxPin] = useState("");
  const [formContactFirstName, setFormContactFirstName] = useState("");
  const [formContactLastName, setFormContactLastName] = useState("");
  const [formContactRole, setFormContactRole] = useState("Managing Director");

  // Save to localStorage when changed
  useEffect(() => {
    try {
      appStorage.setItem(STORAGE_KEY, JSON.stringify(organizations));
    } catch {
      // ignore
    }
  }, [organizations]);

  const selectedOrg = useMemo(() => {
    return organizations.find((o) => o.id === selectedOrgId) || organizations[0] || null;
  }, [organizations, selectedOrgId]);

  // Extract all people
  const allPeople: DirectoryPerson[] = useMemo(() => {
    return organizations.flatMap((org) =>
      org.contacts.map((c) => ({
        ...c,
        organizationName: org.name,
      }))
    );
  }, [organizations]);

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesType = typeFilter === "ALL" || org.type === typeFilter;
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.productFit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [organizations, typeFilter, searchQuery]);

  // Filter people
  const filteredPeople = useMemo(() => {
    return allPeople.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        (p.organizationName && p.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery);
      return matchesSearch;
    });
  }, [allPeople, searchQuery]);

  // Note Editing State
  const [editingNote, setEditingNote] = useState<DirectoryActivity | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");
  const [editingNoteDesc, setEditingNoteDesc] = useState("");

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedOrg) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      type: "NOTE" as const,
      title: "Operational Note Added",
      description: newNoteText.trim(),
      timestamp: "Just now",
      actor: "Operations Lead",
    };

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrg.id
          ? { ...o, activities: [newActivity, ...o.activities] }
          : o
      )
    );
    setNewNoteText("");
  }

  function handleStartEditNote(act: DirectoryActivity) {
    setEditingNote(act);
    setEditingNoteTitle(act.title);
    setEditingNoteDesc(act.description);
  }

  function handleSaveEditNote(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNote || !selectedOrg || !editingNoteDesc.trim()) return;

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrg.id
          ? {
              ...o,
              activities: o.activities.map((a) =>
                a.id === editingNote.id
                  ? {
                      ...a,
                      title: editingNoteTitle.trim() || a.title,
                      description: editingNoteDesc.trim(),
                    }
                  : a
              ),
            }
          : o
      )
    );

    setEditingNote(null);
  }

  function handleDeleteNote(actId: string) {
    if (!selectedOrg) return;
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrg.id
          ? { ...o, activities: o.activities.filter((a) => a.id !== actId) }
          : o
      )
    );
  }

  const openAddModal = () => {
    setEditingOrg(null);
    setFormName("");
    setFormType("CLIENT");
    setFormIndustry("Automotive Services");
    setFormProductFit("Vehisoft");
    setFormCity("Nairobi");
    setFormAddress("Commercial Center");
    setFormPhone("+254 722 000 000");
    setFormEmail("");
    setFormTaxPin("");
    setFormContactFirstName("");
    setFormContactLastName("");
    setFormContactRole("Managing Director");
    setIsOrgModalOpen(true);
  };

  const openEditModal = (org: DirectoryOrganization, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrg(org);
    setFormName(org.name);
    setFormType(org.type);
    setFormIndustry(org.industry);
    setFormProductFit(org.productFit);
    setFormCity(org.city);
    setFormAddress(org.address);
    setFormPhone(org.phone);
    setFormEmail(org.email);
    setFormTaxPin(org.taxPin || "");
    if (org.contacts.length > 0) {
      setFormContactFirstName(org.contacts[0].firstName);
      setFormContactLastName(org.contacts[0].lastName);
      setFormContactRole(org.contacts[0].jobTitle);
    } else {
      setFormContactFirstName("");
      setFormContactLastName("");
      setFormContactRole("Managing Director");
    }
    setIsOrgModalOpen(true);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingOrg) {
      // Update
      const updatedContacts = editingOrg.contacts.length > 0
        ? [
            {
              ...editingOrg.contacts[0],
              firstName: formContactFirstName.trim() || editingOrg.contacts[0].firstName,
              lastName: formContactLastName.trim() || editingOrg.contacts[0].lastName,
              jobTitle: formContactRole.trim() || editingOrg.contacts[0].jobTitle,
              phone: formPhone.trim(),
              email: formEmail.trim(),
            },
            ...editingOrg.contacts.slice(1),
          ]
        : [
            {
              id: `per-${Date.now()}`,
              organizationId: editingOrg.id,
              organizationName: formName.trim(),
              firstName: formContactFirstName.trim() || "Primary",
              lastName: formContactLastName.trim() || "Contact",
              jobTitle: formContactRole.trim() || "Manager",
              email: formEmail.trim(),
              phone: formPhone.trim(),
              whatsapp: formPhone.trim(),
              contactType: "PRIMARY" as const,
            },
          ];

      const updated: DirectoryOrganization = {
        ...editingOrg,
        name: formName.trim(),
        type: formType,
        industry: formIndustry.trim(),
        productFit: formProductFit.trim(),
        city: formCity.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        taxPin: formTaxPin.trim() || undefined,
        contacts: updatedContacts,
      };

      setOrganizations((prev) => prev.map((o) => (o.id === editingOrg.id ? updated : o)));
    } else {
      // Add
      const newId = `org-${Date.now()}`;
      const newOrg: DirectoryOrganization = {
        id: newId,
        name: formName.trim(),
        type: formType,
        industry: formIndustry.trim(),
        productFit: formProductFit.trim(),
        city: formCity.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        taxPin: formTaxPin.trim() || undefined,
        status: "ACTIVE",
        contacts: [
          {
            id: `per-${Date.now()}`,
            organizationId: newId,
            organizationName: formName.trim(),
            firstName: formContactFirstName.trim() || "Primary",
            lastName: formContactLastName.trim() || "Contact",
            jobTitle: formContactRole.trim() || "Manager",
            email: formEmail.trim(),
            phone: formPhone.trim(),
            whatsapp: formPhone.trim(),
            contactType: "PRIMARY",
          },
        ],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "NOTE",
            title: "Organization Profile Initialized",
            description: `Record created directly in Directory hub.`,
            timestamp: "Just now",
            actor: "Operations Lead",
          },
        ],
      };

      setOrganizations((prev) => [newOrg, ...prev]);
      setSelectedOrgId(newId);
    }

    setIsOrgModalOpen(false);
  };

  const handleDeleteOrg = (orgId: string) => {
    setOrganizations((prev) => {
      const remaining = prev.filter((o) => o.id !== orgId);
      if (selectedOrgId === orgId && remaining.length > 0) {
        setSelectedOrgId(remaining[0].id);
      }
      return remaining;
    });
    setDeleteConfirmOrg(null);
  };

  return {
    organizations,
    setOrganizations,
    activeTab,
    setActiveTab,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    selectedOrgId,
    setSelectedOrgId,
    newNoteText,
    setNewNoteText,
    isOrgModalOpen,
    setIsOrgModalOpen,
    editingOrg,
    setEditingOrg,
    deleteConfirmOrg,
    setDeleteConfirmOrg,
    formName,
    setFormName,
    formType,
    setFormType,
    formIndustry,
    setFormIndustry,
    formProductFit,
    setFormProductFit,
    formCity,
    setFormCity,
    formAddress,
    setFormAddress,
    formPhone,
    setFormPhone,
    formEmail,
    setFormEmail,
    formTaxPin,
    setFormTaxPin,
    formContactFirstName,
    setFormContactFirstName,
    formContactLastName,
    setFormContactLastName,
    formContactRole,
    setFormContactRole,
    selectedOrg,
    allPeople,
    filteredOrganizations,
    filteredPeople,
    editingNote,
    setEditingNote,
    editingNoteTitle,
    setEditingNoteTitle,
    editingNoteDesc,
    setEditingNoteDesc,
    handleAddNote,
    handleStartEditNote,
    handleSaveEditNote,
    handleDeleteNote,
    openAddModal,
    openEditModal,
    handleSaveOrg,
    handleDeleteOrg,
  };
}

export type DirectoryModel = ReturnType<typeof useDirectory>;
